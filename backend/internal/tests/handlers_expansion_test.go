package internal

import (
	"fmt"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

func TestUnsubscribeMissingConfigRoom(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial("ws://localhost:8081/ws", headers)
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

func TestHandleSubscribeConfigRoomProposed(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial("ws://localhost:8081/ws", headers)
		if err != nil {
			t.Fatalf("Dial failed: %v", err)
		}
		readWithTimeout(t, c)
		return c
	}

	t.Run("StatusProposed", func(t *testing.T) {
		configRoomID := model.GameID(3000)
		encodedID, _ := model.EncodeID(configRoomID)
		fakeStore.SetConfigRoomForTest(configRoomID, &model.ConfigRoom{
			ID:      configRoomID,
			Creator: model.MinimalUser{ID: "creator", Name: "creator"},
			Status:  model.StatusConfigProposed,
		})

		c := dial("user_proposed")
		defer c.Close()

		err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedID)))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		msg := readWithTimeout(t, c)
		if msg == nil {
			t.Fatal("expected message")
		}
	})

	t.Run("MultipleCandidates", func(t *testing.T) {
		configRoomID := model.GameID(3001)
		encodedID, _ := model.EncodeID(configRoomID)
		fakeStore.SetConfigRoomForTest(configRoomID, &model.ConfigRoom{
			ID:      configRoomID,
			Creator: model.MinimalUser{ID: "creator", Name: "creator"},
			Status:  model.StatusCreated,
		})
		fakeStore.SetCandidatesForTest(configRoomID, []model.Candidate{
			{User: model.MinimalUser{ID: "cand1", Name: "cand1"}},
		})

		c := dial("cand2")
		defer c.Close()

		err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedID)))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		readWithTimeout(t, c)
		msg := readWithTimeout(t, c)
		if msg == nil {
			t.Fatal("expected message for other candidate")
		}
	})
}

func TestHandleSubscribeGameDoesNotExist(t *testing.T) {
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial("ws://localhost:8081/ws", headers)
		if err != nil {
			t.Fatalf("Dial failed: %v", err)
		}
		readWithTimeout(t, c)
		return c
	}

	c := dial("user_game_not_exists")
	defer c.Close()

	encodedID, _ := model.EncodeID(model.GameID(9999))
	err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, encodedID)))
	if err != nil {
		t.Fatalf("WriteMessage failed: %v", err)
	}
	msg := readWithTimeout(t, c)
	if string(msg) != `["Error",{"reason":"game-does-not-exist"}]` {
		t.Errorf("expected game-does-not-exist error, got %s", string(msg))
	}
}

func TestHandleAcceptConfigEdgeCases(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial("ws://localhost:8081/ws", headers)
		if err != nil {
			t.Fatalf("Dial failed: %v", err)
		}
		readWithTimeout(t, c)
		return c
	}

	t.Run("StatusNotProposed", func(t *testing.T) {
		uid := "user_accept_not_proposed"
		c := dial(uid)
		defer c.Close()

		configRoomID := model.GameID(5000)
		encodedID, _ := model.EncodeID(configRoomID)
		fakeStore.SetConfigRoomForTest(configRoomID, &model.ConfigRoom{
			ID:      configRoomID,
			Creator: model.MinimalUser{ID: "other", Name: "other"},
			Status:  model.StatusCreated,
		})

		err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedID)))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}

		found := false
		for i := 0; i < 5; i++ {
			msg := readWithTimeout(t, c)
			if strings.Contains(string(msg), "ConfigRoomUpdate") {
				found = true
				break
			}
		}
		if !found {
			t.Fatal("could not subscribe")
		}

		err = c.WriteMessage(websocket.TextMessage, []byte(`["AcceptConfig"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		found = false
		for i := 0; i < 5; i++ {
			msg := readWithTimeout(t, c)
			if strings.Contains(string(msg), `"Error"`) {
				found = true
				if string(msg) != `["Error",{"reason":"not-allowed"}]` {
					t.Errorf("expected not-allowed error, got %s", string(msg))
				}
				break
			}
		}
		if !found {
			t.Fatal("expected not-allowed error")
		}
	})
}

func TestUnsubscribeAsPlayer(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial("ws://localhost:8081/ws", headers)
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

func TestHandleSelectOpponentEdgeCases(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial("ws://localhost:8081/ws", headers)
		if err != nil {
			t.Fatalf("Dial failed: %v", err)
		}
		readWithTimeout(t, c)
		return c
	}

	t.Run("StatusNotCreated", func(t *testing.T) {
		uid := "creator"
		c := dial(uid)
		defer c.Close()

		configRoomID := model.GameID(6000)
		encodedID, _ := model.EncodeID(configRoomID)
		fakeStore.SetConfigRoomForTest(configRoomID, &model.ConfigRoom{
			ID:      configRoomID,
			Creator: model.MinimalUser{ID: uid, Name: uid},
			Status:  model.StatusStarted,
		})

		c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedID)))
		found := false
		for i := 0; i < 5; i++ {
			msg := readWithTimeout(t, c)
			if strings.Contains(string(msg), "ConfigRoomUpdate") {
				found = true
				break
			}
		}
		if !found {
			t.Fatal("could not subscribe")
		}

		err := c.WriteMessage(websocket.TextMessage, []byte(`["SelectOpponent",{"opponent":{"id":"other","name":"other"}}]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		msg := readWithTimeout(t, c)
		if string(msg) != `["Error",{"reason":"not-allowed"}]` {
			t.Errorf("expected not-allowed error, got %s", string(msg))
		}
	})
}

func TestHandleNotifyTimeoutEdgeCases(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial("ws://localhost:8081/ws", headers)
		if err != nil {
			t.Fatalf("Dial failed: %v", err)
		}
		readWithTimeout(t, c)
		return c
	}

	t.Run("GameFinished", func(t *testing.T) {
		uid := "player_timeout_test"
		opponent := "opponent_timeout_test"
		c := dial(uid)
		defer c.Close()

		gameID := model.GameID(7000)
		encodedID, _ := model.EncodeID(gameID)
		fakeStore.SetGameForTest(gameID, &model.Game{
			GameID:     gameID,
			GameName:   "test-game",
			PlayerZero: model.MinimalUser{ID: uid, Name: uid},
			PlayerOne:  model.MinimalUser{ID: opponent, Name: opponent},
			Result:     model.ResultTimeoutOfOne,
		})
		fakeStore.SetConfigRoomForTest(gameID, &model.ConfigRoom{
			ID:             gameID,
			Creator:        model.MinimalUser{ID: uid, Name: uid},
			ChosenOpponent: &model.MinimalUser{ID: opponent, Name: opponent},
			Status:         model.StatusFinished,
			GameName:       "test-game",
		})

		c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, encodedID)))
		foundGameUpdate := false
		foundSyncEvent := false
		for i := 0; i < 5; i++ {
			msg := readWithTimeout(t, c)
			if strings.Contains(string(msg), "GameUpdate") {
				foundGameUpdate = true
			}
			if strings.Contains(string(msg), "GameEvent") {
				foundSyncEvent = true
			}
			if foundGameUpdate && foundSyncEvent {
				break
			}
		}
		if !foundGameUpdate {
			t.Fatal("could not subscribe")
		}
		if !foundSyncEvent {
			t.Fatal("did not receive sync event")
		}

		err := c.WriteMessage(websocket.TextMessage, []byte(`["NotifyTimeout",{"timeoutedPlayer":1}]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		game := fakeStore.GameForTest(gameID)
		if game.Result != model.ResultTimeoutOfOne {
			t.Errorf("expected result to remain TimeoutOfOne, got %s", game.Result)
		}
		if err := c.SetReadDeadline(time.Now().Add(200 * time.Millisecond)); err != nil {
			t.Fatalf("SetReadDeadline failed: %v", err)
		}
		_, msg, err := c.ReadMessage()
		if err == nil {
			t.Fatalf("expected duplicate timeout notification to be ignored, got %s", string(msg))
		}
	})
}
