package internal

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gorilla/websocket"
	"gorm.io/gorm"

	everyboard "github.com/EveryBoard/EveryBoard/internal"
	"github.com/EveryBoard/EveryBoard/internal/auth"
	"github.com/EveryBoard/EveryBoard/internal/model"
)

// Mocks for testing Prepare failures

type FailingFirebase struct {
	auth.Firebase
}

func (f FailingFirebase) Initialize() error {
	return fmt.Errorf("forced firebase failure")
}

type FailingEncoder struct {
	model.SqidsEncoder
}

func (e *FailingEncoder) Initialize() error {
	return fmt.Errorf("forced encoder failure")
}

type FailingDialector struct {
	gorm.Dialector
}

func (d FailingDialector) Initialize(db *gorm.DB) error {
	return fmt.Errorf("forced dialector failure")
}

func TestPrepareFailures(t *testing.T) {
	t.Run("FirebaseFailure", func(t *testing.T) {
		config := &everyboard.Configuration{
			Firebase:  FailingFirebase{},
			IDEncoder: &model.SqidsEncoder{},
		}
		_, err := everyboard.Prepare(config)
		if err == nil {
			t.Fatal("expected error on failing firebase initialization")
		}
	})

	t.Run("EncoderFailure", func(t *testing.T) {
		config := &everyboard.Configuration{
			Firebase:  FirebaseMock{}, // from everyboard_test.go or similar
			IDEncoder: &FailingEncoder{},
		}
		// Need to ensure auth doesn't fail
		auth.SetFirebaseClient(FirebaseMock{})
		
		_, err := everyboard.Prepare(config)
		if err == nil {
			t.Fatal("expected error on failing encoder initialization")
		}
	})

	t.Run("DatabaseFailure", func(t *testing.T) {
		config := &everyboard.Configuration{
			Firebase:  FirebaseMock{},
			IDEncoder: &model.SqidsEncoder{},
			Database:  FailingDialector{},
		}
		auth.SetFirebaseClient(FirebaseMock{})
		model.SetIDEncoder(&model.SqidsEncoder{})
		
		_, err := everyboard.Prepare(config)
		if err == nil {
			t.Fatal("expected error on failing database initialization")
		}
	})
}

func TestServeHTTPUnauthorized(t *testing.T) {
	// Given a configuration and a request without token
	config := &everyboard.Configuration{
		Firebase: FirebaseMock{},
	}
	auth.SetFirebaseClient(FirebaseMock{})
	
	req := httptest.NewRequest("GET", "/ws", nil)
	rr := httptest.NewRecorder()

	// When calling ServeHTTP
	config.ServeHTTP(rr, req)

	// Then it should return 401 Unauthorized
	if rr.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", rr.Code)
	}
}

func TestHandlersCommonInjections(t *testing.T) {
	// Exercise the default implementations of the injected functions
	// This is mostly for coverage of the default functions themselves
	t.Run("Now", func(t *testing.T) {
		n := everyboard.Now()
		if n <= 0 {
			t.Errorf("unexpected value from Now: %d", n)
		}
	})

	t.Run("NowFloat", func(t *testing.T) {
		nf := everyboard.NowFloat()
		if nf <= 0 {
			t.Errorf("unexpected value from NowFloat: %f", nf)
		}
	})

	t.Run("RandBool", func(t *testing.T) {
		// Just call it to ensure it doesn't panic and we get coverage
		_ = everyboard.RandBool()
	})
}

func TestSendMessageToClosedConnection(t *testing.T) {
	stopServer, _, config := PrepareServer(t)
	defer stopServer()

	// Create a connection and immediately close it in CM
	headers := http.Header{}
	headers.Set("Sec-WebSocket-Protocol", tokenForUser("user1"))
	c, _, err := websocket.DefaultDialer.Dial("ws://localhost:8081/ws", headers)
	if err != nil {
		t.Fatalf("Dial failed: %v", err)
	}
	// Give it time to register
	time.Sleep(100 * time.Millisecond)
	
	// Close it from CM side
	user, _ := config.Connections.GetUserOfClient(c)
	config.Connections.RemoveConnection(user, c)
	
	// Try to send a message
	config.Connections.SendMessage(c, model.ErrorMessage{Reason: "test"})
	
	// Should not panic, and should be skipped in push loop
	time.Sleep(100 * time.Millisecond)
}

func readWithTimeout(t *testing.T, c *websocket.Conn) []byte {
	c.SetReadDeadline(time.Now().Add(2 * time.Second))
	_, msg, err := c.ReadMessage()
	if err != nil {
		t.Logf("ReadMessage failed (might be expected): %v", err)
		return nil
	}
	return msg
}

func TestUnsubscribeEdgeCases(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	// Helper to create a connection
	dial := func(uid string) *websocket.Conn {
		payload := fmt.Sprintf(`{"sub":"%s"}`, uid)
		encodedPayload := base64.RawURLEncoding.EncodeToString([]byte(payload))
		token := fmt.Sprintf("Authorization, yJhbGciOiJub25lIiwidHlwIjoiSldUIn0.%s.", encodedPayload)
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", token)
		c, _, err := websocket.DefaultDialer.Dial("ws://localhost:8081/ws", headers)
		if err != nil {
			t.Fatalf("Dial failed: %v", err)
		}
		// Skip the initial message
		readWithTimeout(t, c)
		return c
	}

	t.Run("NotSubscribed", func(t *testing.T) {
		c := dial("user_not_sub")
		defer c.Close()
		err := c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
	})

	t.Run("Lobby", func(t *testing.T) {
		c := dial("user_lobby")
		defer c.Close()
		err := c.WriteMessage(websocket.TextMessage, []byte(`["SubscribeLobby"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		readWithTimeout(t, c) // skip lobby update
		err = c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
	})

	t.Run("GameObserver", func(t *testing.T) {
		c := dial("user_observer")
		defer c.Close()
		gameID := model.GameID(42)
		encodedGameID, _ := model.EncodeID(gameID)
		fakeStore.Games[gameID] = &model.Game{
			GameID:     gameID,
			GameName:   "testgame",
			PlayerZero: model.MinimalUser{ID: "other1", Name: "Other 1"},
			PlayerOne:  model.MinimalUser{ID: "other2", Name: "Other 2"},
		}
		fakeStore.ConfigRooms[gameID] = &model.ConfigRoom{
			ID:      gameID,
			Creator: model.MinimalUser{ID: "other1", Name: "Other 1"},
			Status:  model.StatusStarted,
		}
		err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, encodedGameID)))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		readWithTimeout(t, c) // skip subscription messages
		err = c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
	})

	t.Run("ConfigRoomCreator", func(t *testing.T) {
		uid := "user_creator"
		c := dial(uid)
		defer c.Close()
		configRoomID := model.GameID(100)
		encodedConfigRoomID, _ := model.EncodeID(configRoomID)
		fakeStore.ConfigRooms[configRoomID] = &model.ConfigRoom{
			ID:      configRoomID,
			Creator: model.MinimalUser{ID: uid, Name: uid},
			Status:  model.StatusCreated,
		}
		err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedConfigRoomID)))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		readWithTimeout(t, c) // skip subscription messages
		err = c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		// Give it a bit of time to process
		time.Sleep(100 * time.Millisecond)
		// Config room should be deleted
		if fakeStore.ConfigRooms[configRoomID] != nil {
			t.Errorf("Config room should have been deleted")
		}
	})

	t.Run("ConfigRoomCandidate", func(t *testing.T) {
		uid := "user_candidate"
		c := dial(uid)
		defer c.Close()
		configRoomID := model.GameID(101)
		encodedConfigRoomID, _ := model.EncodeID(configRoomID)
		fakeStore.ConfigRooms[configRoomID] = &model.ConfigRoom{
			ID:       configRoomID,
			Creator:  model.MinimalUser{ID: "creator", Name: "creator"},
			Status:   model.StatusCreated,
			GameName: "test",
		}
		
		err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedConfigRoomID)))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		readWithTimeout(t, c)

		err = c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		time.Sleep(100 * time.Millisecond)
		// User should no longer be a candidate
		for _, cand := range fakeStore.Candidates[configRoomID] {
			if cand.User.ID == uid {
				t.Errorf("user should have been removed from candidates")
			}
		}
	})

	t.Run("ConfigRoomChosenOpponent", func(t *testing.T) {
		uid := "user_opponent"
		c := dial(uid)
		defer c.Close()
		configRoomID := model.GameID(102)
		encodedConfigRoomID, _ := model.EncodeID(configRoomID)
		fakeStore.ConfigRooms[configRoomID] = &model.ConfigRoom{
			ID:             configRoomID,
			Creator:        model.MinimalUser{ID: "creator", Name: "creator"},
			ChosenOpponent: &model.MinimalUser{ID: uid, Name: uid},
			Status:         model.StatusCreated,
		}
		
		err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedConfigRoomID)))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		readWithTimeout(t, c)

		err = c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		time.Sleep(100 * time.Millisecond)
		// Chosen opponent should be cleared
		if fakeStore.ConfigRooms[configRoomID].ChosenOpponent != nil {
			t.Errorf("chosen opponent should have been cleared")
		}
	})
}
