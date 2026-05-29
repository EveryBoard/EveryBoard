package server

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/gorilla/websocket"
)

func TestHandleSubscribeGameDoesNotExist(t *testing.T) {
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
		require.NoError(t, err, "Dial failed")
		readWithTimeout(t, c)
		return c
	}

	c := dial("user_game_not_exists")
	defer c.Close()

	encodedID, _ := model.EncodeID(model.GameID(9999))
	err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, encodedID)))
	require.NoError(t, err, "WriteMessage failed")
	msg := readWithTimeout(t, c)
	assert.Equal(t, `["Error",{"reason":"game-does-not-exist"}]`, string(msg), "expected game-does-not-exist error")
}

func TestSubscribeGameRollback(t *testing.T) {
	stopServer, _, config := PrepareServer(t)
	defer stopServer()

	uid := "rollback-user"
	c := EstablishWebSocketConnection(t, uid)
	defer c.Close()

	// Encode a game ID that decodes successfully but does not exist in the store.
	missingID, err := model.EncodeID(model.GameID(999999))
	require.NoError(t, err, "cannot encode id")
	sendRawMessage(t, c, fmt.Sprintf(`["SubscribeGame", {"gameId":"%s"}]`, missingID))

	// Wait for processing
	time.Sleep(200 * time.Millisecond)

	assert.False(t, config.Subscriptions.IsSubscribed(uid), "User should not be subscribed after failed SubscribeGame (rollback failed)")
}

func TestHandleAcceptEdgeCases(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
		require.NoError(t, err, "Dial failed")
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
		require.NoError(t, err, "WriteMessage failed")
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
		require.NoError(t, err, "WriteMessage failed")
		time.Sleep(100 * time.Millisecond)
		game := fakeStore.GameForTest(gameID)
		assert.True(t, game.Result.IsDraw(), "expected draw")
	})
}

func TestHandleGameEnd(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
		require.NoError(t, err, "Dial failed")
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
		require.NoError(t, err, "WriteMessage failed")
		time.Sleep(100 * time.Millisecond)
		game := fakeStore.GameForTest(gameID)
		assert.Equal(t, model.ResultVictoryOfZero, game.Result, "expected VictoryOfZero")
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
		require.NoError(t, err, "WriteMessage failed")
		time.Sleep(100 * time.Millisecond)
		game := fakeStore.GameForTest(gameID)
		assert.Equal(t, model.ResultVictoryOfOne, game.Result, "expected VictoryOfOne")
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
		require.NoError(t, err, "WriteMessage failed")
		time.Sleep(100 * time.Millisecond)
		game := fakeStore.GameForTest(gameID)
		assert.Equal(t, model.ResultHardDraw, game.Result, "expected HardDraw")
	})
}

func TestHandleAcceptRematchEdgeCases(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
		require.NoError(t, err, "Dial failed")
		readWithTimeout(t, c)
		return c
	}

	t.Run("NotSubscribed", func(t *testing.T) {
		c := dial("user_not_sub")
		defer c.Close()

		err := c.WriteMessage(websocket.TextMessage, []byte(`["Accept",{"proposition":"Rematch"}]`))
		require.NoError(t, err, "WriteMessage failed")
		msg := readWithTimeout(t, c)
		assert.Equal(t, `["Error",{"reason":"not-subscribed"}]`, string(msg), "expected not-subscribed error")
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
		require.NoError(t, err, "WriteMessage failed")
		msg := readWithTimeout(t, c)
		assert.Equal(t, `["Error",{"reason":"not-allowed"}]`, string(msg), "expected not-allowed error")
	})
}

func TestHandleNotifyTimeoutEdgeCases(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
		require.NoError(t, err, "Dial failed")
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
		require.True(t, foundGameUpdate, "expected GameUpdate message")
		require.True(t, foundSyncEvent, "expected SyncEvent message")

		err := c.WriteMessage(websocket.TextMessage, []byte(`["NotifyTimeout",{"timeoutedPlayer":1}]`))
		require.NoError(t, err, "WriteMessage failed")
		game := fakeStore.GameForTest(gameID)
		assert.Equal(t, model.ResultTimeoutOfOne, game.Result, "expected TimeoutOfOne")
		require.NoError(t, c.SetReadDeadline(time.Now().Add(200*time.Millisecond)), "SetReadDeadline failed")
		_, _, err = c.ReadMessage()
		require.Error(t, err, "failed to read message")
	})
}

func TestResign(t *testing.T) {
	sb, _, opponent, _ := setupTwoPlayersGame(t)
	sb.Resign(opponent) // opponent resigns
	sb.Cleanup()
}

func TestNotifyTimeout(t *testing.T) {
	sb, player, _, _ := setupTwoPlayersGame(t)
	sb.NotifyTimeout(player)
	sb.Cleanup()
}

func TestEndGame(t *testing.T) {
	sb, player, _, _ := setupTwoPlayersGame(t)
	sb.EndGame(player, 0)
	sb.Cleanup()
}

func TestRejectProposal(t *testing.T) {
	sb, player, opponent, _ := setupTwoPlayersGame(t)
	sb.ProposeDraw(player)
	sb.RejectDraw(opponent)
	sb.Cleanup()
}

func TestAddTime(t *testing.T) {
	sb, player, _, _ := setupTwoPlayersGame(t)
	defer sb.Cleanup()

	sb.AddTime(player)
}

func TestSendMoveFromObserverOnStartedGame(t *testing.T) {
	// Given a started game and an observer
	sb, _, _, gameId := setupTwoPlayersGame(t)
	defer sb.Cleanup()

	observer := sb.EstablishConnection("observer")
	sb.SubscribeGame(observer, gameId)

	// When the observer sends a move
	sendRawMessage(t, sb.getConnection(observer), `["Move",{"move":{"lol":true}}]`)
	// Then it should be disallowed
	expectMessage(t, sb.getConnection(observer), `["Error",{"reason":"not-allowed"}]`)
}

func TestSendMoveOnFinishedGame(t *testing.T) {
	// Given a finished game
	sb, player, _, _ := setupTwoPlayersGame(t)
	defer sb.Cleanup()
	sb.Resign(player)

	// When a player sends a move, it should be disallowd
	sendRawMessage(t, sb.getConnection(player), `["Move",{"move":{"lol":true}}]`)
	// Then it should be disallowed
	expectMessage(t, sb.getConnection(player), `["Error",{"reason":"not-allowed"}]`)
}
