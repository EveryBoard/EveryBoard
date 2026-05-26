package internal

import (
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/gorilla/websocket"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

func TestHandleSubscribeConfigRoomEdgeCases(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial("ws://localhost:8081/ws", headers)
		if err != nil {
			t.Fatalf("Dial failed: %v", err)
		}
		readWithTimeout(t, c) // skip initial message
		return c
	}

	t.Run("AlreadySubscribed", func(t *testing.T) {
		c := dial("user_already_sub")
		defer c.Close()

		// Add a config room to ensure SubscribeLobby sends a message
		fakeStore.SetConfigRoomForTest(model.GameID(500), &model.ConfigRoom{
			ID:       model.GameID(500),
			GameName: "test",
			Status:   model.StatusCreated,
		})

		// First subscription
		err := c.WriteMessage(websocket.TextMessage, []byte(`["SubscribeLobby"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		readWithTimeout(t, c)

		// Second subscription should fail
		err = c.WriteMessage(websocket.TextMessage, []byte(`["SubscribeLobby"]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		msg := readWithTimeout(t, c)
		if string(msg) != `["Error",{"reason":"already-subscribed"}]` {
			t.Errorf("expected already-subscribed error, got %s", string(msg))
		}
	})

	t.Run("ConfigRoomDoesNotExist", func(t *testing.T) {
		c := dial("user_non_existent")
		defer c.Close()

		encodedID, _ := model.EncodeID(model.GameID(999))
		err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedID)))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		msg := readWithTimeout(t, c)
		if string(msg) != `["Error",{"reason":"game-does-not-exist"}]` {
			t.Errorf("expected game-does-not-exist error, got %s", string(msg))
		}
	})

	t.Run("StatusStarted", func(t *testing.T) {
		c := dial("user_observer")
		defer c.Close()

		configRoomID := model.GameID(200)
		encodedID, _ := model.EncodeID(configRoomID)
		fakeStore.SetConfigRoomForTest(configRoomID, &model.ConfigRoom{
			ID:      configRoomID,
			Creator: model.MinimalUser{ID: "creator", Name: "creator"},
			Status:  model.StatusStarted,
		})

		err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedID)))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		// Should succeed but send minimal info
		msg := readWithTimeout(t, c)
		if msg == nil {
			t.Error("expected message, got none")
		}
	})

	t.Run("SubscribeAsCandidate", func(t *testing.T) {
		c := dial("user_candidate")
		defer c.Close()

		configRoomID := model.GameID(600)
		encodedID, _ := model.EncodeID(configRoomID)
		fakeStore.SetConfigRoomForTest(configRoomID, &model.ConfigRoom{
			ID:       configRoomID,
			Creator:  model.MinimalUser{ID: "creator", Name: "creator"},
			Status:   model.StatusCreated,
			GameName: "test",
		})

		err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedID)))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		msg := readWithTimeout(t, c)
		if msg == nil {
			t.Fatal("expected message")
		}
		found := false
		for _, cand := range fakeStore.CandidatesForTest(configRoomID) {
			if cand.User.ID == "user_candidate" {
				found = true
				break
			}
		}
		if !found {
			t.Error("user should have been added as candidate")
		}
	})

	t.Run("StatusFinished", func(t *testing.T) {
		c := dial("user_finished")
		defer c.Close()

		configRoomID := model.GameID(201)
		encodedID, _ := model.EncodeID(configRoomID)
		fakeStore.SetConfigRoomForTest(configRoomID, &model.ConfigRoom{
			ID:      configRoomID,
			Creator: model.MinimalUser{ID: "creator", Name: "creator"},
			Status:  model.StatusFinished,
		})

		err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedID)))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		msg := readWithTimeout(t, c)
		if msg == nil {
			t.Fatal("expected message")
		}
	})
}

func TestHandleAcceptEdgeCases(t *testing.T) {
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

	t.Run("TakeBack", func(t *testing.T) {
		uid := "player0"
		c := dial(uid)
		defer c.Close()

		gameID := model.GameID(700)
		encodedID, _ := model.EncodeID(gameID)
		fakeStore.SetGameForTest(gameID, &model.Game{
			GameID:     gameID,
			PlayerZero: model.MinimalUser{ID: uid, Name: uid},
			PlayerOne:  model.MinimalUser{ID: "player1", Name: "player1"},
		})
		fakeStore.SetConfigRoomForTest(gameID, &model.ConfigRoom{
			ID:      gameID,
			Creator: model.MinimalUser{ID: uid, Name: uid},
			Status:  model.StatusStarted,
		})

		c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, encodedID)))
		readWithTimeout(t, c)

		err := c.WriteMessage(websocket.TextMessage, []byte(`["Accept",{"proposition":"TakeBack"}]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		time.Sleep(100 * time.Millisecond)
	})

	t.Run("Draw", func(t *testing.T) {
		uid := "player_draw"
		c := dial(uid)
		defer c.Close()

		gameID := model.GameID(800)
		encodedID, _ := model.EncodeID(gameID)
		fakeStore.SetGameForTest(gameID, &model.Game{
			GameID:     gameID,
			PlayerZero: model.MinimalUser{ID: uid, Name: uid},
			PlayerOne:  model.MinimalUser{ID: "player1", Name: "player1"},
			Result:     model.ResultInProgress,
		})
		fakeStore.SetConfigRoomForTest(gameID, &model.ConfigRoom{
			ID:             gameID,
			Creator:        model.MinimalUser{ID: uid, Name: uid},
			ChosenOpponent: &model.MinimalUser{ID: "player1", Name: "player1"},
			Status:         model.StatusStarted,
		})

		c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, encodedID)))
		readWithTimeout(t, c)

		err := c.WriteMessage(websocket.TextMessage, []byte(`["Accept",{"proposition":"Draw"}]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		time.Sleep(100 * time.Millisecond)
		game := fakeStore.GameForTest(gameID)
		if !game.Result.IsDraw() {
			t.Errorf("expected draw, got %s", game.Result)
		}
	})
}

func TestHandleGameEnd(t *testing.T) {
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

	t.Run("WinnerZero", func(t *testing.T) {
		uid := "player_w0"
		c := dial(uid)
		defer c.Close()

		gameID := model.GameID(900)
		encodedID, _ := model.EncodeID(gameID)
		fakeStore.SetGameForTest(gameID, &model.Game{
			GameID:     gameID,
			PlayerZero: model.MinimalUser{ID: uid, Name: uid},
			PlayerOne:  model.MinimalUser{ID: "player1", Name: "player1"},
			Result:     model.ResultInProgress,
		})
		fakeStore.SetConfigRoomForTest(gameID, &model.ConfigRoom{
			ID:             gameID,
			Creator:        model.MinimalUser{ID: uid, Name: uid},
			ChosenOpponent: &model.MinimalUser{ID: "player1", Name: "player1"},
			Status:         model.StatusStarted,
		})

		c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, encodedID)))
		readWithTimeout(t, c)

		err := c.WriteMessage(websocket.TextMessage, []byte(`["EndGame",{"winner":0}]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		time.Sleep(100 * time.Millisecond)
		game := fakeStore.GameForTest(gameID)
		if game.Result != model.ResultVictoryOfZero {
			t.Errorf("expected VictoryOfZero, got %s", game.Result)
		}
	})

	t.Run("WinnerOne", func(t *testing.T) {
		uid := "player_w1"
		c := dial(uid)
		defer c.Close()

		gameID := model.GameID(901)
		encodedID, _ := model.EncodeID(gameID)
		fakeStore.SetGameForTest(gameID, &model.Game{
			GameID:     gameID,
			PlayerZero: model.MinimalUser{ID: "player0", Name: "player0"},
			PlayerOne:  model.MinimalUser{ID: uid, Name: uid},
			Result:     model.ResultInProgress,
		})
		fakeStore.SetConfigRoomForTest(gameID, &model.ConfigRoom{
			ID:             gameID,
			Creator:        model.MinimalUser{ID: "player0", Name: "player0"},
			ChosenOpponent: &model.MinimalUser{ID: uid, Name: uid},
			Status:         model.StatusStarted,
		})

		c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, encodedID)))
		readWithTimeout(t, c)

		err := c.WriteMessage(websocket.TextMessage, []byte(`["EndGame",{"winner":1}]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		time.Sleep(100 * time.Millisecond)
		game := fakeStore.GameForTest(gameID)
		if game.Result != model.ResultVictoryOfOne {
			t.Errorf("expected VictoryOfOne, got %s", game.Result)
		}
	})

	t.Run("WinnerNone", func(t *testing.T) {
		uid := "player_wnone"
		c := dial(uid)
		defer c.Close()

		gameID := model.GameID(902)
		encodedID, _ := model.EncodeID(gameID)
		fakeStore.SetGameForTest(gameID, &model.Game{
			GameID:     gameID,
			PlayerZero: model.MinimalUser{ID: uid, Name: uid},
			PlayerOne:  model.MinimalUser{ID: "player1", Name: "player1"},
			Result:     model.ResultInProgress,
		})
		fakeStore.SetConfigRoomForTest(gameID, &model.ConfigRoom{
			ID:             gameID,
			Creator:        model.MinimalUser{ID: uid, Name: uid},
			ChosenOpponent: &model.MinimalUser{ID: "player1", Name: "player1"},
			Status:         model.StatusStarted,
		})

		c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, encodedID)))
		readWithTimeout(t, c)

		err := c.WriteMessage(websocket.TextMessage, []byte(`["EndGame",{"winner":2}]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		time.Sleep(100 * time.Millisecond)
		game := fakeStore.GameForTest(gameID)
		if game.Result != model.ResultHardDraw {
			t.Errorf("expected HardDraw, got %s", game.Result)
		}
	})
}

func TestHandleCreateGameEdgeCases(t *testing.T) {
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

	t.Run("AlreadyInGame", func(t *testing.T) {
		uid := "user_already_in_game"
		c := dial(uid)
		defer c.Close()

		fakeStore.SetCurrentGameForTest(uid, &model.CurrentGame{
			GameID: model.GameID(1000),
			Role:   model.UserRoleCreator,
		})

		err := c.WriteMessage(websocket.TextMessage, []byte(`["Create",{"gameName":"test"}]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		msg := readWithTimeout(t, c)
		if string(msg) != `["Error",{"reason":"already-subscribed"}]` {
			t.Errorf("expected already-subscribed error, got %s", string(msg))
		}
	})
}

func TestHandleAcceptRematchEdgeCases(t *testing.T) {
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

	t.Run("NotSubscribed", func(t *testing.T) {
		c := dial("user_not_sub")
		defer c.Close()

		err := c.WriteMessage(websocket.TextMessage, []byte(`["Accept",{"proposition":"Rematch"}]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		msg := readWithTimeout(t, c)
		if string(msg) != `["Error",{"reason":"not-subscribed"}]` {
			t.Errorf("expected not-subscribed error, got %s", string(msg))
		}
	})

	t.Run("GameNotFinished", func(t *testing.T) {
		uid := "user_not_finished"
		c := dial(uid)
		defer c.Close()

		gameID := model.GameID(300)
		encodedID, _ := model.EncodeID(gameID)
		fakeStore.SetConfigRoomForTest(gameID, &model.ConfigRoom{
			ID:      gameID,
			Creator: model.MinimalUser{ID: uid, Name: uid},
			Status:  model.StatusStarted,
		})

		c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedID)))
		readWithTimeout(t, c)

		err := c.WriteMessage(websocket.TextMessage, []byte(`["Accept",{"proposition":"Rematch"}]`))
		if err != nil {
			t.Fatalf("WriteMessage failed: %v", err)
		}
		msg := readWithTimeout(t, c)
		if string(msg) != `["Error",{"reason":"not-allowed"}]` {
			t.Errorf("expected not-allowed error, got %s", string(msg))
		}
	})
}
