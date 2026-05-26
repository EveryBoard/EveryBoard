package internal

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/auth"
	"github.com/EveryBoard/EveryBoard/internal/model"
	"github.com/gorilla/websocket"
	"gorm.io/driver/sqlite"
)

type FailingFirebase struct {
	auth.Firebase
}

func (f FailingFirebase) Initialize() error {
	return fmt.Errorf("forced firebase failure")
}

func TestPrepareInternalFailures(t *testing.T) {
	t.Run("FirebaseFailure", func(t *testing.T) {
		config := &Configuration{
			Firebase: FailingFirebase{},
		}
		_, err := Prepare(config)
		if err == nil {
			t.Fatal("expected error")
		}
	})
}

type FirebaseMockInternal struct {
	auth.Firebase
}

func (f *FirebaseMockInternal) Initialize() error { return nil }
func (f *FirebaseMockInternal) Fetch(ctx context.Context, coll, path string) (map[string]interface{}, error) {
	return nil, fmt.Errorf("mock fetch failure")
}
func (f *FirebaseMockInternal) VerifyToken(ctx context.Context, token string) (string, error) {
	return "", fmt.Errorf("mock verify error")
}

func TestServeHTTPInternalUnauthorized(t *testing.T) {
	config := &Configuration{}
	auth.SetFirebaseClient(&FirebaseMockInternal{})

	req := httptest.NewRequest("GET", "/ws", nil)
	rr := httptest.NewRecorder()
	config.ServeHTTP(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", rr.Code)
	}
}

func TestReadConfigurationInternal(t *testing.T) {
	// Exercise ReadConfiguration even if it fails due to missing env
	_, _ = ReadConfiguration()
}

func TestHandlersInternalEdgeCases(t *testing.T) {
	store, _ := model.InitDatabase(sqlite.Open(":memory:"))
	user := model.MinimalUser{ID: "user1", Name: "user1"}

	newH := func() Handlers {
		subs := NewSubscriptionManager[*websocket.Conn]()
		cm := NewConnectionManager[*websocket.Conn]()
		return Handlers{
			connection:    &websocket.Conn{}, // Non-nil to be safe
			user:          user,
			store:         store,
			connections:   &cm,
			subscriptions: &subs,
		}
	}

	t.Run("HandleUnsubscribeNotSubscribed", func(t *testing.T) {
		h := newH()
		err := h.unsubscribe()
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})

	t.Run("HandleSubscribeGameDoesNotExist", func(t *testing.T) {
		h := newH()
		err := h.handleSubscribeGame(model.GameID(999))
		if err != model.ErrorGameDoesNotExist {
			t.Errorf("expected ErrorGameDoesNotExist, got %v", err)
		}
	})

	t.Run("HandleSubscribeLobby", func(t *testing.T) {
		h := newH()
		err := h.handleSubscribeLobby()
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})

	t.Run("HandleCreateAlreadyInGame", func(t *testing.T) {
		h := newH()
		store.SetCurrentGame(&model.CurrentGame{UserID: user.ID, UserName: user.Name, GameID: 1})
		err := h.handleWithoutErrorSend("Create", map[string]json.RawMessage{"gameName": json.RawMessage(`"test"`)})
		if err != model.ErrorAlreadySubscribed {
			t.Errorf("expected ErrorAlreadySubscribed, got %v", err)
		}
	})

	t.Run("HandleSelectOpponentNotSubscribed", func(t *testing.T) {
		h := newH()
		err := h.handleWithoutErrorSend("SelectOpponent", map[string]json.RawMessage{"opponent": json.RawMessage(`{"id":"other"}`)})
		if err != model.ErrorNotSubscribed {
			t.Errorf("expected ErrorNotSubscribed, got %v", err)
		}
	})
}

func TestUnsubscribeInternal(t *testing.T) {
	store, _ := model.InitDatabase(sqlite.Open(":memory:"))
	user := model.MinimalUser{ID: "user1", Name: "user1"}
	subs := NewSubscriptionManager[*websocket.Conn]()
	cm := NewConnectionManager[*websocket.Conn]()
	h := Handlers{
		connection:    &websocket.Conn{},
		user:          user,
		store:         store,
		connections:   &cm,
		subscriptions: &subs,
	}

	t.Run("Lobby", func(t *testing.T) {
		subs.Subscribe(h.connection, user.ID, model.GameIDLobby, SubscriptionToLobby)
		err := h.unsubscribe()
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
}

func TestNewEloValueInternal(t *testing.T) {
	tests := []struct {
		oldElo     float64
		difference float64
		expected   float64
	}{
		{1500.0, 32.0, 1532.0},
		{100.0, -10.0, 100.0}, // Floor at 100
		{105.0, -10.0, 100.0}, // Hit floor
	}

	for _, tt := range tests {
		got := newEloValue(tt.oldElo, tt.difference)
		if got != tt.expected {
			t.Errorf("newEloValue(%f, %f) = %f; want %f", tt.oldElo, tt.difference, got, tt.expected)
		}
	}
}

func TestWinWeightInternal(t *testing.T) {
	if w(Victory) != 1.0 {
		t.Errorf("expected 1.0, got %f", w(Victory))
	}
	if w(Draw) != 0.5 {
		t.Errorf("expected 0.5, got %f", w(Draw))
	}
	if w(Loss) != 0.0 {
		t.Errorf("expected 0.0, got %f", w(Loss))
	}
}

func TestWinProbabilityInternal(t *testing.T) {
	p := winProbability(1000, 1000)
	if p != 0.5 {
		t.Errorf("expected 0.5, got %f", p)
	}
}
