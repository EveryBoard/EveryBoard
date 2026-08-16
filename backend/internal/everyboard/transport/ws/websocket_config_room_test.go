package ws
// TODO: rename file to config_room something

import (
	"encoding/json"
	"fmt"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"net/http"
	"strings"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/gorilla/websocket"
)

// TODO: add simple tests:
// - user can subscribe to config room
// - bot can subscribe to config room
// - bot can subscribe twice to config room
// TODO: read on t.Run and see what is preferred betwene this and TestXXX, and how to better name tests

func TestHandleSubscribeConfigRoomEdgeCases(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
		require.NoError(t, err, "Dial failed")
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
		require.NoError(t, err, "WriteMessage failed")
		readWithTimeout(t, c)

		// Second subscription should fail
		err = c.WriteMessage(websocket.TextMessage, []byte(`["SubscribeLobby"]`))
		require.NoError(t, err, "WriteMessage failed")
		msg := readWithTimeout(t, c)
		assert.Equal(t, `["Error",{"reason":"already-subscribed"}]`, string(msg), "expected already-subscribed error")
	})

	t.Run("ConfigRoomDoesNotExist", func(t *testing.T) {
		c := dial("user_non_existent")
		defer c.Close()

		encodedID, _ := model.EncodeID(model.GameID(999))
		err := c.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, encodedID)))
		require.NoError(t, err, "WriteMessage failed")
		msg := readWithTimeout(t, c)
		assert.Equal(t, `["Error",{"reason":"game-does-not-exist"}]`, string(msg), "expected game-does-not-exist error")
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
		require.NoError(t, err, "WriteMessage failed")
		// Should succeed but send minimal info
		msg := readWithTimeout(t, c)
		assert.NotNil(t, msg, "expected message, got none")
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
		require.NoError(t, err, "WriteMessage failed")
		msg := readWithTimeout(t, c)
		require.NotNil(t, msg, "expected message")
		found := false
		for _, cand := range fakeStore.CandidatesForTest(configRoomID) {
			if cand.User.ID == "user_candidate" {
				found = true
				break
			}
		}
		assert.True(t, found, "user should have been added as candidate")
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
		require.NoError(t, err, "WriteMessage failed")
		msg := readWithTimeout(t, c)
		require.NotNil(t, msg, "expected message")
	})
}

func TestHandleSubscribeConfigRoomProposed(t *testing.T) {
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
		require.NoError(t, err, "WriteMessage failed")
		msg := readWithTimeout(t, c)
		require.NotNil(t, msg, "expected message")
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
		require.NoError(t, err, "WriteMessage failed")
		readWithTimeout(t, c)
		msg := readWithTimeout(t, c)
		require.NotNil(t, msg, "expected message for other candidate")
	})
}

func TestHandleAcceptConfigEdgeCases(t *testing.T) {
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
		require.NoError(t, err, "WriteMessage failed")

		found := false
		for i := 0; i < 5; i++ {
			msg := readWithTimeout(t, c)
			if strings.Contains(string(msg), "ConfigRoomUpdate") {
				found = true
				break
			}
		}
		require.True(t, found, "could not subscribe")

		err = c.WriteMessage(websocket.TextMessage, []byte(`["AcceptConfig"]`))
		require.NoError(t, err, "WriteMessage failed")
		found = false
		for i := 0; i < 5; i++ {
			msg := readWithTimeout(t, c)
			if strings.Contains(string(msg), `"Error"`) {
				found = true
				assert.Equal(t, `["Error",{"reason":"not-allowed"}]`, string(msg), "expected not-allowed error")
				break
			}
		}
		require.True(t, found, "expected not-allowed error")
	})
}

func TestHandleSelectOpponentEdgeCases(t *testing.T) {
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
		require.True(t, found, "could not subscribe")

		err := c.WriteMessage(websocket.TextMessage, []byte(`["SelectOpponent",{"opponent":{"id":"other","name":"other"}}]`))
		require.NoError(t, err, "WriteMessage failed")
		msg := readWithTimeout(t, c)
		assert.Equal(t, `["Error",{"reason":"not-allowed"}]`, string(msg), "expected not-allowed error")
	})
}

func TestSelectOpponentOnStartedGame(t *testing.T) {
	// Given a started game (setupTwoPlayersGame sets Status=Started via AcceptConfig)
	sb, player, opponent, _ := setupTwoPlayersGame(t)
	defer sb.Cleanup()

	// When trying to select an opponent
	userOpponent := sb.getUser(opponent)
	sendRawMessage(t, sb.getConnection(player), fmt.Sprintf(`["SelectOpponent",{"opponent":%s}]`, toJSON(t, userOpponent)))

	// Then it should be disallowed
	expectMessage(t, sb.getConnection(player), `["Error",{"reason":"not-allowed"}]`)
}

func TestProposeConfigOnStartedGame(t *testing.T) {
	// Given a started game
	sb, player, _, _ := setupTwoPlayersGame(t)
	defer sb.Cleanup()

	// When trying to propose the config
	config := model.ConfigProposal{
		GameType:     model.GameTypeStandard,
		MoveDuration: 120,
		GameDuration: 1800,
		FirstPlayer:  model.FirstPlayerCreator,
		RulesConfig:  json.RawMessage(`null`),
	}
	sendRawMessage(t, sb.getConnection(player), fmt.Sprintf(`["ProposeConfig",{"config":%s}]`, toJSON(t, config)))

	// Then it should be disallowed
	expectMessage(t, sb.getConnection(player), `["Error",{"reason":"not-allowed"}]`)
}

func TestReviewConfigOnStartedGame(t *testing.T) {
	// Given a started game
	sb, player, _, _ := setupTwoPlayersGame(t)
	defer sb.Cleanup()

	// When trying to review it
	sendRawMessage(t, sb.getConnection(player), `["ReviewConfig"]`)

	// Then it should be disallowed
	expectMessage(t, sb.getConnection(player), `["Error",{"reason":"not-allowed"}]`)
}

func TestAcceptConfigOnStartedGame(t *testing.T) {
	// Given a started game
	sb, player, _, _ := setupTwoPlayersGame(t)
	defer sb.Cleanup()

	// When trying to accept it
	sendRawMessage(t, sb.getConnection(player), `["AcceptConfig"]`)

	// Then it should be disallowed
	expectMessage(t, sb.getConnection(player), `["Error",{"reason":"not-allowed"}]`)
}

func TestForbiddenActions(t *testing.T) {
	sb := NewScenarioBuilder(t)
	defer sb.Cleanup()

	creator := sb.EstablishConnection("creator")
	gameId := sb.Create(creator, "p4")
	sb.SubscribeConfigRoom(creator, gameId)
	conn := sb.getConnection(creator)

	// 1. ReviewConfig when not proposed
	sendRawMessage(t, conn, `["ReviewConfig"]`)
	expectMessage(t, conn, `["Error",{"reason":"not-allowed"}]`)

	// 2. AcceptConfig when not proposed
	sendRawMessage(t, conn, `["AcceptConfig"]`)
	expectMessage(t, conn, `["Error",{"reason":"not-allowed"}]`)
}
