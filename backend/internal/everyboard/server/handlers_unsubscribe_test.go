package server

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/gorilla/websocket"
)

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
		c, _, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
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
		fakeStore.SetGameForTest(gameID, &model.Game{
			GameID:     gameID,
			GameName:   "testgame",
			PlayerZero: model.MinimalUser{ID: "other1", Name: "Other 1"},
			PlayerOne:  model.MinimalUser{ID: "other2", Name: "Other 2"},
		})
		fakeStore.SetConfigRoomForTest(gameID, &model.ConfigRoom{
			ID:      gameID,
			Creator: model.MinimalUser{ID: "other1", Name: "Other 1"},
			Status:  model.StatusStarted,
		})
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
		fakeStore.SetConfigRoomForTest(configRoomID, &model.ConfigRoom{
			ID:      configRoomID,
			Creator: model.MinimalUser{ID: uid, Name: uid},
			Status:  model.StatusCreated,
		})
		err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedConfigRoomID)))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		readWithTimeout(t, c) // skip subscription messages
		err = c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		for i := 0; i < 5; i++ {
			msg := readWithTimeout(t, c)
			if strings.Contains(string(msg), `"CurrentGameUpdate"`) && strings.Contains(string(msg), `"currentGame":null`) {
				break
			}
		}
		// Config room should be deleted
		if fakeStore.ConfigRoomForTest(configRoomID) != nil {
			t.Errorf("Config room should have been deleted")
		}
	})

	t.Run("ConfigRoomCandidate", func(t *testing.T) {
		uid := "user_candidate"
		c := dial(uid)
		defer c.Close()
		configRoomID := model.GameID(101)
		encodedConfigRoomID, _ := model.EncodeID(configRoomID)
		fakeStore.SetConfigRoomForTest(configRoomID, &model.ConfigRoom{
			ID:       configRoomID,
			Creator:  model.MinimalUser{ID: "creator", Name: "creator"},
			Status:   model.StatusCreated,
			GameName: "test",
		})

		err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedConfigRoomID)))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		readWithTimeout(t, c)

		err = c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		for i := 0; i < 5; i++ {
			msg := readWithTimeout(t, c)
			if strings.Contains(string(msg), `"CurrentGameUpdate"`) && strings.Contains(string(msg), `"currentGame":null`) {
				break
			}
		}
		// User should no longer be a candidate
		for _, cand := range fakeStore.CandidatesForTest(configRoomID) {
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
		fakeStore.SetConfigRoomForTest(configRoomID, &model.ConfigRoom{
			ID:             configRoomID,
			Creator:        model.MinimalUser{ID: "creator", Name: "creator"},
			ChosenOpponent: &model.MinimalUser{ID: uid, Name: uid},
			Status:         model.StatusCreated,
		})

		err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedConfigRoomID)))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		readWithTimeout(t, c)

		err = c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		for i := 0; i < 5; i++ {
			msg := readWithTimeout(t, c)
			if strings.Contains(string(msg), `"CurrentGameUpdate"`) && strings.Contains(string(msg), `"currentGame":null`) {
				break
			}
		}
		// Chosen opponent should be cleared
		configRoom := fakeStore.ConfigRoomForTest(configRoomID)
		if configRoom.ChosenOpponent != nil {
			t.Errorf("chosen opponent should have been cleared")
		}
	})
}

func TestUnsubscribeMissingConfigRoom(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
		if err != nil {
			t.Fatalf("Dial failed: %v", err)
		}
		readWithTimeout(t, c)
		return c
	}

	t.Run("ConfigRoomGone", func(t *testing.T) {
		uid := "user_gone"
		c := dial(uid)
		defer c.Close()

		configRoomID := model.GameID(2000)
		encodedID, _ := model.EncodeID(configRoomID)
		fakeStore.SetConfigRoomForTest(configRoomID, &model.ConfigRoom{
			ID:      configRoomID,
			Creator: model.MinimalUser{ID: uid, Name: uid},
			Status:  model.StatusCreated,
		})

		c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedID)))
		readWithTimeout(t, c)

		fakeStore.DeleteConfigRoomForTest(configRoomID)

		err := c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		time.Sleep(100 * time.Millisecond)
	})

	t.Run("StatusNotUnstarted", func(t *testing.T) {
		uid := "user_status_not_unstarted"
		c := dial(uid)
		defer c.Close()

		configRoomID := model.GameID(2001)
		encodedID, _ := model.EncodeID(configRoomID)
		fakeStore.SetConfigRoomForTest(configRoomID, &model.ConfigRoom{
			ID:      configRoomID,
			Creator: model.MinimalUser{ID: uid, Name: uid},
			Status:  model.StatusFinished,
		})

		c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedID)))
		readWithTimeout(t, c)

		err := c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		time.Sleep(100 * time.Millisecond)
	})
}

func TestUnsubscribeAsPlayer(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
		if err != nil {
			t.Fatalf("Dial failed: %v", err)
		}
		readWithTimeout(t, c)
		return c
	}

	t.Run("PlayerLeavesGame", func(t *testing.T) {
		uid := "player_test"
		c := dial(uid)
		defer c.Close()

		gameID := model.GameID(4000)
		encodedID, _ := model.EncodeID(gameID)
		fakeStore.SetGameForTest(gameID, &model.Game{
			GameID:     gameID,
			PlayerZero: model.MinimalUser{ID: uid, Name: uid},
			PlayerOne:  model.MinimalUser{ID: "other", Name: "other"},
		})
		fakeStore.SetConfigRoomForTest(gameID, &model.ConfigRoom{
			ID:      gameID,
			Creator: model.MinimalUser{ID: uid, Name: uid},
			Status:  model.StatusStarted,
		})
		fakeStore.SetCurrentGameForTest(uid, &model.CurrentGame{
			GameID: gameID,
			Role:   model.UserRoleCreator,
		})

		c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, encodedID)))

		found := false
		for i := 0; i < 5; i++ {
			msg := readWithTimeout(t, c)
			if strings.Contains(string(msg), "GameUpdate") {
				found = true
				break
			}
		}
		if !found {
			t.Fatal("could not subscribe")
		}

		err := c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		time.Sleep(200 * time.Millisecond)
		if fakeStore.CurrentGameForTest(uid) == nil {
			t.Errorf("player current game should NOT have been removed")
		}
	})
}
