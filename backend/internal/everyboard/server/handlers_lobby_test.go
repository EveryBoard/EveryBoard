package server

import (
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/handler"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/gorilla/websocket"
)

func TestSubscribeToLobbyShouldSubscribe(t *testing.T) {
	stopServer, _, config := PrepareServer(t)
	defer stopServer()

	// Given an established connection
	c := EstablishWebSocketConnection(t, "foo")
	defer c.Close()

	// When subscribing to lobby
	sendRawMessage(t, c, `["SubscribeLobby"]`)
	time.Sleep(100 * time.Millisecond)

	// Then we should should be subscribed
	if !config.Subscriptions.IsSubscribed("foo") {
		t.Fatalf("user should be subscribed")
	}
}

func TestSubscribeToLobbyWithMessagesAndConfigRooms(t *testing.T) {
	handler.Now = func() int64 { return 42 }
	stopServer, fakeStore, _ := PrepareServer(t)
	defer stopServer()

	userFoo := model.MinimalUser{ID: "foo", Name: "foo"}

	// Pre-populate the fakeStore with a lobby message and a config room
	msg := model.Message{
		GameID:    model.GameIDLobby,
		Sender:    userFoo,
		Timestamp: 42,
		Content:   "hello",
	}
	fakeStore.SetMessagesForTest(model.GameIDLobby, []*model.Message{&msg})

	configRoom := model.ConfigRoom{
		ID:                2,
		Creator:           userFoo,
		CreatorElo:        0,
		ChosenOpponent:    nil,
		ChosenOpponentElo: nil,
		Status:            model.StatusCreated,
		FirstPlayer:       model.FirstPlayerRandom,
		GameType:          model.GameTypeStandard,
		MoveDuration:      model.StandardMoveDuration,
		GameDuration:      model.StandardGameDuration,
		RulesConfig:       nil,
		GameName:          "P4",
	}
	fakeStore.SetConfigRoomForTest(configRoom.ID, &configRoom)
	fakeStore.SetNextIDForTest(configRoom.ID)

	// Given an established connection to a server with a config room and a lobby message
	c := EstablishWebSocketConnection(t, "bar")
	defer c.Close()

	// When subscribing to the lobby
	sendRawMessage(t, c, `["SubscribeLobby"]`)

	encodedId, _ := model.EncodeID(configRoom.ID)
	// Then we should receive one message for the chat message and one for the config room
	expectMessage(t, c, `["ChatMessage",{"message":{"sender":{"id":"foo","name":"foo"},"timestamp":42,"content":"hello"}}]`)
	expectMessage(t, c, fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, encodedId, toJSON(t, &configRoom)))
}

func TestHandleCreateGameEdgeCases(t *testing.T) {
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

func TestLobbyUserCannotSendMove(t *testing.T) {
	// Given a lobby subscriber
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()

	c := EstablishWebSocketConnection(t, "malicious")
	defer c.Close()

	sendRawMessage(t, c, `["SubscribeLobby"]`)
	// When they send a move
	sendRawMessage(t, c, `["Move",{"move":{"x":42}}]`)
	// Then it should not be alowed
	expectMessage(t, c, `["Error",{"reason":"unknown-game"}]`)
}
