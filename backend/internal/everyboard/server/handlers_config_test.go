package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/gorilla/websocket"
)

func TestHandleSubscribeConfigRoomEdgeCases(t *testing.T) {
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
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

func TestHandleSubscribeConfigRoomProposed(t *testing.T) {
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

func TestHandleAcceptConfigEdgeCases(t *testing.T) {
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

func TestHandleSelectOpponentEdgeCases(t *testing.T) {
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
