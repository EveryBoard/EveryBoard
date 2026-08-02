package ws

import (
	"encoding/base64"
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
		require.NoError(t, err, "Dial failed")
		// Skip the initial message
		readWithTimeout(t, c)
		return c
	}

	t.Run("NotSubscribed", func(t *testing.T) {
		c := dial("user_not_sub")
		defer c.Close()
		err := c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		require.NoError(t, err, "WriteMessage failed")
	})

	t.Run("Lobby", func(t *testing.T) {
		c := dial("user_lobby")
		defer c.Close()
		err := c.WriteMessage(websocket.TextMessage, []byte(`["SubscribeLobby"]`))
		require.NoError(t, err, "WriteMessage failed")
		readWithTimeout(t, c) // skip lobby update
		err = c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		require.NoError(t, err, "WriteMessage failed")
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
		require.NoError(t, err, "WriteMessage failed")
		readWithTimeout(t, c) // skip subscription messages
		err = c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		require.NoError(t, err, "WriteMessage failed")
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
		require.NoError(t, err, "WriteMessage failed")
		readWithTimeout(t, c) // skip subscription messages
		err = c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		require.NoError(t, err, "WriteMessage failed")
		for i := 0; i < 5; i++ {
			msg := readWithTimeout(t, c)
			if strings.Contains(string(msg), `"CurrentGameUpdate"`) && strings.Contains(string(msg), `"currentGame":null`) {
				break
			}
		}
		// Config room should be deleted
		assert.Nil(t, fakeStore.ConfigRoomForTest(configRoomID), "config room should have been deleted")
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
		require.NoError(t, err, "WriteMessage failed")
		readWithTimeout(t, c)

		err = c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		require.NoError(t, err, "WriteMessage failed")
		for i := 0; i < 5; i++ {
			msg := readWithTimeout(t, c)
			if strings.Contains(string(msg), `"CurrentGameUpdate"`) && strings.Contains(string(msg), `"currentGame":null`) {
				break
			}
		}
		// User should no longer be a candidate
		for _, cand := range fakeStore.CandidatesForTest(configRoomID) {
			assert.NotEqual(t, uid, cand.User.ID, "unsubscribed candidate should have been removed")
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
		require.NoError(t, err, "WriteMessage failed")
		readWithTimeout(t, c)

		err = c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		require.NoError(t, err, "WriteMessage failed")
		for i := 0; i < 5; i++ {
			msg := readWithTimeout(t, c)
			if strings.Contains(string(msg), `"CurrentGameUpdate"`) && strings.Contains(string(msg), `"currentGame":null`) {
				break
			}
		}
		// Chosen opponent should be cleared
		configRoom := fakeStore.ConfigRoomForTest(configRoomID)
		assert.Nil(t, configRoom.ChosenOpponent, "chosen opponent should have been removed")
	})
}

func TestUnsubscribeMissingConfigRoom(t *testing.T) {
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
		require.NoError(t, err, "WriteMessage failed")
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
		require.NoError(t, err, "WriteMessage failed")
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
		require.NoError(t, err, "Dial failed")
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
		require.True(t, found, "expected config room deletion message")

		err := c.WriteMessage(websocket.TextMessage, []byte(`["Unsubscribe"]`))
		require.NoError(t, err, "WriteMessage failed")
		time.Sleep(200 * time.Millisecond)
		assert.NotNil(t, fakeStore.CurrentGameForTest(uid), "player should remain in current game")
	})
}
