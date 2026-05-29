package handler

import (
	"encoding/json"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/session"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/store"
	"github.com/gorilla/websocket"
	"gorm.io/driver/sqlite"
)

func TestHandlersDirectEdgeCases(t *testing.T) {
	store, _ := store.InitDatabase(sqlite.Open(":memory:"))
	user := model.MinimalUser{ID: "user1", Name: "user1"}

	newH := func() Handler {
		subs := session.NewSubscriptionManager[*websocket.Conn]()
		cm := session.NewConnectionManager[*websocket.Conn]()
		return Handler{
			connection:    &websocket.Conn{}, // Non-nil to be safe
			user:          user,
			store:         store,
			connections:   &cm,
			subscriptions: &subs,
		}
	}

	t.Run("HandleUnsubscribeNotSubscribed", func(t *testing.T) {
		// Given a handler where we did not subscribe
		h := newH()
		// When calling unsubscribe
		err := h.unsubscribe()
		// Then it should not result in an error
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})

	t.Run("HandleSubscribeGameDoesNotExist", func(t *testing.T) {
		// Given a handler
		h := newH()
		// When we subscribe to a non existing game
		err := h.handleSubscribeGame(model.GameID(999))
		// Then it should fail
		if err != apperror.ErrorGameDoesNotExist {
			t.Errorf("expected ErrorGameDoesNotExist, got %v", err)
		}
	})

	t.Run("HandleSubscribeLobby", func(t *testing.T) {
		// Given a handler
		h := newH()
		// When we subscribe to the lobby
		err := h.handleSubscribeLobby()
		// Then it should succeed
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})

	t.Run("HandleCreateAlreadyInGame", func(t *testing.T) {
		h := newH()
		store.SetCurrentGame(&model.CurrentGame{UserID: user.ID, UserName: user.Name, GameID: 1})
		err := h.handleWithoutErrorSend("Create", map[string]json.RawMessage{"gameName": json.RawMessage(`"test"`)})
		if err != apperror.ErrorAlreadySubscribed {
			t.Errorf("expected ErrorAlreadySubscribed, got %v", err)
		}
	})

	t.Run("HandleSelectOpponentNotSubscribed", func(t *testing.T) {
		h := newH()
		err := h.handleWithoutErrorSend("SelectOpponent", map[string]json.RawMessage{"opponent": json.RawMessage(`{"id":"other"}`)})
		if err != apperror.ErrorNotSubscribed {
			t.Errorf("expected ErrorNotSubscribed, got %v", err)
		}
	})
}

func TestUnsubscribeDirect(t *testing.T) {
	store, _ := store.InitDatabase(sqlite.Open(":memory:"))
	user := model.MinimalUser{ID: "user1", Name: "user1"}
	subs := session.NewSubscriptionManager[*websocket.Conn]()
	cm := session.NewConnectionManager[*websocket.Conn]()
	h := Handler{
		connection:    &websocket.Conn{},
		user:          user,
		store:         store,
		connections:   &cm,
		subscriptions: &subs,
	}

	t.Run("Lobby", func(t *testing.T) {
		subs.Subscribe(h.connection, user.ID, model.GameIDLobby, session.SubscriptionToLobby)
		err := h.unsubscribe()
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
	})
}
