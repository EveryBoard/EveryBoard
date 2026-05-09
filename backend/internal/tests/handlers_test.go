package internal

import (
	"encoding/json"
	"fmt"
	"testing"
	"time"

	everyboard "github.com/EveryBoard/EveryBoard/internal"
	"github.com/EveryBoard/EveryBoard/internal/model"
)

func TestSubscribeToLobbyShouldSubscribe(t *testing.T) {
	stopServer, _, config := PrepareServer(t)
	defer stopServer()

	// Given an established connection
	c := EstablishWebSocketConnection(t, "foo")
	defer c.Close()

	// When subscribing to lobby
	sendMessage(t, c, `["SubscribeLobby"]`)
	time.Sleep(100 * time.Millisecond)

	// Then we should should be subscribed
	if !config.Subscriptions.IsSubscribed("foo") {
		t.Fatalf("user should be subscribed")
	}
}

func TestSubscribeToLobbyWithMessagesAndConfigRooms(t *testing.T) {
	everyboard.Now = func() int64 { return 42 }
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
	fakeStore.Messages[model.GameIDLobby] = []*model.Message{&msg}

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
	fakeStore.ConfigRooms[configRoom.ID] = &configRoom
	fakeStore.nextID = configRoom.ID

	// Given an established connection to a server with a config room and a lobby message
	c := EstablishWebSocketConnection(t, "bar")
	defer c.Close()

	// When subscribing to the lobby
	sendMessage(t, c, `["SubscribeLobby"]`)

	encodedId, _ := model.EncodeID(configRoom.ID)
	// Then we should receive one message for the chat message and one for the config room
	expectMessage(t, c, `["ChatMessage",{"message":{"sender":{"id":"foo","name":"foo"},"timestamp":42,"content":"hello"}}]`)
	expectMessage(t, c, fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, encodedId, toJSON(t, &configRoom)))
}

func TestGameFlow(t *testing.T) {
	sb := NewScenarioBuilder(t)
	player := sb.EstablishConnection("player")
	opponent := sb.EstablishConnection("opponent")

	sb.SubscribeLobby(opponent)              // opponent opens lobby
	gameId := sb.Create(player, "P4")        // player creates game
	sb.SubscribeConfigRoom(player, gameId)   // player subscribes to the config room
	sb.Unsubscribe(opponent)                 // opponent unsubscribes from the lobby
	sb.SubscribeConfigRoom(opponent, gameId) // opponent subscribes to the config room
	sb.SelectOpponent(player, opponent)      // player selects the opponent
	proposal := model.ConfigProposal{
		GameType:     model.GameTypeStandard,
		MoveDuration: 120,
		GameDuration: 1800,
		FirstPlayer:  model.FirstPlayerRandom,
		RulesConfig:  json.RawMessage(`null`),
	}
	sb.ProposeConfig(player, proposal)             // player proposes to the opponent
	sb.ReviewConfig(player)                        // player reviews the config
	sb.ProposeConfig(player, proposal)             // player proposes the config again
	sb.AcceptConfig(opponent)                      // opponent accepts (the game starts)
	sb.Unsubscribe(player)                         // player unsubscribes from the config room
	sb.Unsubscribe(opponent)                       // opponent unsubscribes from the config room
	sb.SubscribeGame(player, gameId)               // player subscribes to the game
	sb.SubscribeGame(opponent, gameId)             // opponent subscribes to the game
	observer := sb.EstablishConnection("observer") // an observer joins
	sb.SubscribeGame(observer, gameId)             // the observer subscribes to the game
	sb.Move(player, json.RawMessage(`{"x":42}`))   // player plays one move
	sb.ProposeDraw(opponent)                       // opponent proposes draw
	sb.AcceptDraw(player)                          // player accepts

	sb.ProposeRematch(player)           // player proposes a rematch
	gameId = sb.AcceptRematch(opponent) // opponent accepts the rematch
	sb.Unsubscribe(player)              // player leaves the finished game
	sb.Unsubscribe(opponent)            // opponent too
	sb.SubscribeGame(player, gameId)    // player joins the rematch
	sb.SubscribeGame(opponent, gameId)  // opponent too
	sb.Resign(player)                   // player resigns

	sb.Cleanup()
}

func setupTwoPlayersGame(t *testing.T) (ScenarioBuilder, string, string, model.GameID) {
	sb := NewScenarioBuilder(t)
	player := sb.EstablishConnection("player")
	opponent := sb.EstablishConnection("opponent")
	gameId := sb.Create(player, "P4")        // player creates game
	sb.SubscribeConfigRoom(player, gameId)   // player subscribes to the config room
	sb.SubscribeConfigRoom(opponent, gameId) // opponent subscribes to the config room
	sb.SelectOpponent(player, opponent)      // player selects the opponent
	proposal := model.ConfigProposal{
		GameType:     model.GameTypeStandard,
		MoveDuration: 120,
		GameDuration: 1800,
		FirstPlayer:  model.FirstPlayerRandom,
		RulesConfig:  json.RawMessage(`null`),
	}
	sb.ProposeConfig(player, proposal) // player proposes to the opponent
	sb.AcceptConfig(opponent)          // opponent accepts (the game starts)
	sb.Unsubscribe(player)             // player unsubscribes from the config room
	sb.Unsubscribe(opponent)           // opponent unsubscribes from the config room
	sb.SubscribeGame(player, gameId)   // player subscribes to the game
	sb.SubscribeGame(opponent, gameId) // opponent subscribes to the game
	return sb, player, opponent, gameId
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

func TestInvalidMessages(t *testing.T) {
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()

	client := EstablishWebSocketConnection(t, "player")
	defer client.Close()

	// Invalid message because tag does not exist
	sendMessage(t, client, `["Invalid"]`)
	expectMessage(t, client, `["Error",{"reason":"unknown-message"}]`)

	// Invalid message because it's not even JSON
	sendMessage(t, client, `Invalid`)
	expectMessage(t, client, `["Error",{"reason":"unknown-message"}]`)

	// SubscribeConfigRoom needs a gameId
	sendMessage(t, client, `["SubscribeConfigRoom", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// SubscribeGame needs a gameId
	sendMessage(t, client, `["SubscribeGame", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// ChatSend needs a message
	sendMessage(t, client, `["ChatSend", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// Create needs a gameName
	sendMessage(t, client, `["Create", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// SelectOpponent needs an opponent
	sendMessage(t, client, `["SelectOpponent", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// ProposeConfig needs a config
	sendMessage(t, client, `["ProposeConfig", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// NotifyTimeout needs a timeoutedPlayer
	sendMessage(t, client, `["NotifyTimeout", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// EndGame needs a winner
	sendMessage(t, client, `["EndGame", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// Propose needs a proposition
	sendMessage(t, client, `["Propose", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// Reject needs a propposition
	sendMessage(t, client, `["Reject", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// Accept needs a propposition
	sendMessage(t, client, `["Accept", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// AddTime needs a kind
	sendMessage(t, client, `["AddTime", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// Move needs a move
	sendMessage(t, client, `["Move", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)
}

func TestSelectOpponentOnStartedGame(t *testing.T) {
	// Given a started game (setupTwoPlayersGame sets Status=Started via AcceptConfig)
	sb, player, opponent, _ := setupTwoPlayersGame(t)
	defer sb.Cleanup()

	// When trying to select an opponent
	userOpponent := sb.getUser(opponent)
	sendMessage(t, sb.getConnection(player), fmt.Sprintf(`["SelectOpponent",{"opponent":%s}]`, toJSON(t, userOpponent)))

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
	sendMessage(t, sb.getConnection(player), fmt.Sprintf(`["ProposeConfig",{"config":%s}]`, toJSON(t, config)))

	// Then it should be disallowed
	expectMessage(t, sb.getConnection(player), `["Error",{"reason":"not-allowed"}]`)
}

func TestReviewConfigOnStartedGame(t *testing.T) {
	// Given a started game
	sb, player, _, _ := setupTwoPlayersGame(t)
	defer sb.Cleanup()

	// When trying to review it
	sendMessage(t, sb.getConnection(player), `["ReviewConfig"]`)

	// Then it should be disallowed
	expectMessage(t, sb.getConnection(player), `["Error",{"reason":"not-allowed"}]`)
}

func TestAcceptConfigOnStartedGame(t *testing.T) {
	// Given a started game
	sb, player, _, _ := setupTwoPlayersGame(t)
	defer sb.Cleanup()

	// When trying to accept it
	sendMessage(t, sb.getConnection(player), `["AcceptConfig"]`)

	// Then it should be disallowed
	expectMessage(t, sb.getConnection(player), `["Error",{"reason":"not-allowed"}]`)
}

func TestSendMoveFromObserverOnStartedGame(t *testing.T) {
	// Given a started game and an observer
	sb, _, _, gameId := setupTwoPlayersGame(t)
	defer sb.Cleanup()

	observer := sb.EstablishConnection("observer")
	sb.SubscribeGame(observer, gameId)

	// When the observer sends a move
	sendMessage(t, sb.getConnection(observer), `["Move",{"move":{"lol":true}}]`)
	// Then it should be disallowed
	expectMessage(t, sb.getConnection(observer), `["Error",{"reason":"not-allowed"}]`)
}

func TestSendMoveOnFinishedGame(t *testing.T) {
	// Given a finished game
	sb, player, _, _ := setupTwoPlayersGame(t)
	defer sb.Cleanup()
	sb.Resign(player)

	// When a player sends a move, it should be disallowd
	sendMessage(t, sb.getConnection(player), `["Move",{"move":{"lol":true}}]`)
	// Then it should be disallowed
	expectMessage(t, sb.getConnection(player), `["Error",{"reason":"not-allowed"}]`)
}

func TestSendChatMessage(t *testing.T) {
	// Given a game
	sb, player, opponent, _ := setupTwoPlayersGame(t)
	defer sb.Cleanup()

	// When sending a chat message
	sendMessage(t, sb.getConnection(player), `["ChatSend",{"message":"hello"}]`)
	// Then it should be sent to both players
	expectMessage(t, sb.getConnection(player), `["ChatMessage",{"message":{"sender":{"id":"player","name":"player"},"timestamp":42,"content":"hello"}}]`)
	expectMessage(t, sb.getConnection(opponent), `["ChatMessage",{"message":{"sender":{"id":"player","name":"player"},"timestamp":42,"content":"hello"}}]`)
}

func TestSendChatMessageTooLong(t *testing.T) {
	// Given a game
	sb, player, _, _ := setupTwoPlayersGame(t)
	defer sb.Cleanup()

	// When sending a too long chat message
	sendMessage(t, sb.getConnection(player), `["ChatSend",{"message":"this message is too long to be allowed in the chat because we restrict the messages to 128 characters. This is checked both in the frontend and the backend. Without this, a malicious user could send a message of unbounded length, which would bloat the db and this is not something we want"}]`)
	// Then it should be disallowed
	expectMessage(t, sb.getConnection(player), `["Error",{"reason":"not-allowed"}]`)
}

func TestLobbyUserCannotSendMove(t *testing.T) {
	// Given a lobby subscriber
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()

	c := EstablishWebSocketConnection(t, "malicious")
	defer c.Close()

	sendMessage(t, c, `["SubscribeLobby"]`)
	// When they send a move
	sendMessage(t, c, `["Move",{"move":{"x":42}}]`)
	// Then it should not be alowed
	expectMessage(t, c, `["Error",{"reason":"unknown-game"}]`)
}
