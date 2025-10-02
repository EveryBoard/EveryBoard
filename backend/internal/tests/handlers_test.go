package internal

import (
	"encoding/json"
	"testing"
	"time"

	everyboard "github.com/EveryBoard/EveryBoard/internal"
	"github.com/EveryBoard/EveryBoard/internal/model"
)


func TestSubscribeToLobbyShouldSubscribe(t *testing.T) {
	stopServer, _ := PrepareServer(t)
	defer stopServer()

	// Given an established connection
	c := EstablishWebSocketConnection(t, "foo")
	defer c.Close()

	// When subscribing to lobby
	sendMessage(t, c, `["SubscribeLobby"]`)
	time.Sleep(100 * time.Millisecond)

	// Then we should should be subscribed
	if !everyboard.Subscriptions.IsSubscribed("foo") {
		t.Fatalf("user should be subscribed")
	}
}

func TestSubscribeToLobbyWithMessagesAndConfigRooms(t *testing.T) {
	everyboard.Now = func() int64 {
		return 42
	}
	stopServer, mock := PrepareServer(t)
	defer stopServer()

	// Given an established connection to a server with a config room and a lobby message
	otherConnection := EstablishWebSocketConnection(t, "foo")
	defer otherConnection.Close()

	ExpectMessageSelection(mock, 1, []model.Message{})
	ExpectInGameConfigRoomSelection(mock, []model.ConfigRoom{})
	sendMessage(t, otherConnection, `["SubscribeLobby"]`)

	userFoo := model.MinimalUser{ID: "foo", Name: "foo"}
	message := model.Message{
		ID: 1,
		GameID: model.GameIDLobby,
		Sender: userFoo,
		Timestamp: 42,
		Content: "hello",
	}
	configRoom := model.ConfigRoom{
		ID: 2,
		Creator: userFoo,
		CreatorElo: 0,
		ChosenOpponent: nil,
		Status: model.StatusCreated,
		FirstPlayer: model.FirstPlayerRandom,
		GameType: model.GameTypeStandard,
		MoveDuration: model.StandardMoveDuration,
		GameDuration: model.StandardGameDuration,
		RulesConfig: json.RawMessage(`null`),
		GameName: "P4",
	}
	ExpectMessageInsertion(mock, message)
	sendMessage(t, otherConnection, `["ChatSend",{"message":"hello"}]`)
	sendMessage(t, otherConnection, `["Unsubscribe"]`)

	ExpectEloSelection(mock, "foo", "P4", nil)
	ExpectEloInsertion(mock, model.Elo{
		ID: 1,
		User: userFoo,
		GameName: "P4",
		CurrentElo: 0,
		GamesPlayed: 0,
	})
	ExpectConfigRoomInsertion(mock, configRoom)
	currentGame := model.CurrentGame{
		ID: 1,
		User: userFoo,
		GameID: configRoom.ID,
		GameName: "P4",
		Creator: userFoo,
		Opponent: nil,
		Role: model.UserRoleCreator,
	}
	ExpectCurrentGameInsertion(mock, currentGame)

	sendMessage(t, otherConnection, `["Create", {"gameName":"P4"}]`)

	// When subscribing to the lobby
	c := EstablishWebSocketConnection(t, "bar")
	defer c.Close()

	ExpectMessageSelection(mock, 1, []model.Message{message})
	ExpectInGameConfigRoomSelection(mock, []model.ConfigRoom{configRoom})
	sendMessage(t, c, `["SubscribeLobby"]`)

	// Then we should receive one message for the chat message and one for the config room
	expectMessage(t, c, `["ChatMessage",{"message":{"sender":{"id":"foo","name":"foo"},"timestamp":42,"content":"hello"}}]`)
	expectMessage(t, c, `["ConfigRoomUpdate",{"gameId":"gbHJd","configRoom":{"creator":{"id":"foo","name":"foo"},"creatorElo":0,"chosenOpponent":null,"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`)
}

func TestGameFlowSimpler(t *testing.T) {
	sb := NewScenarioBuilder(t)
	player := sb.EstablishConnection("player")
	opponent := sb.EstablishConnection("opponent")

	sb.SubscribeLobby(opponent) // opponent opens lobby
	gameId := sb.Create(player, "P4") // player creates game
	sb.SubscribeConfigRoom(player, gameId) // player subscribes to the config room
	sb.Unsubscribe(opponent) // opponent unsubscribes from the lobby
	sb.SubscribeConfigRoom(opponent, gameId) // opponent subscribes to the config room
	sb.SelectOpponent(player, opponent) // player selects the opponent
	proposal := model.ConfigProposal{
		GameType: model.GameTypeStandard,
		MoveDuration: 120,
		GameDuration: 1800,
		FirstPlayer: model.FirstPlayerRandom,
		RulesConfig: json.RawMessage(`null`),
	}
	sb.ProposeConfig(player, proposal) // player proposes to the opponent
	sb.ReviewConfig(player) // player reviews the config
	sb.ProposeConfig(player, proposal) // player proposes the config again
	sb.AcceptConfig(opponent) // opponent accepts (the game starts)
	sb.Unsubscribe(player) // player unsubscribes from the config room
	sb.Unsubscribe(opponent) // opponent unsubscribes from the config room
	sb.SubscribeGame(player, gameId) // player subscribes to the game
	sb.SubscribeGame(opponent, gameId) // opponent subscribes to the game
	observer := sb.EstablishConnection("observer") // an observer joins
	sb.SubscribeGame(observer, gameId) // the observer subscribes to the game
	sb.Move(player,  json.RawMessage(`{"x":42}`)) // player plays one move
	sb.ProposeDraw(opponent)// opponent proposes draw
	sb.AcceptDraw(player) // player accepts

	sb.Cleanup()
}

func setupTwoPlayersGame(t *testing.T) (ScenarioBuilder, string, string, model.GameID) {
	sb := NewScenarioBuilder(t)
	player := sb.EstablishConnection("player")
	opponent := sb.EstablishConnection("opponent")
	gameId := sb.Create(player, "P4") // player creates game
	sb.SubscribeConfigRoom(player, gameId) // player subscribes to the config room
	sb.SubscribeConfigRoom(opponent, gameId) // opponent subscribes to the config room
	sb.SelectOpponent(player, opponent) // player selects the opponent
	proposal := model.ConfigProposal{
		GameType: model.GameTypeStandard,
		MoveDuration: 120,
		GameDuration: 1800,
		FirstPlayer: model.FirstPlayerRandom,
		RulesConfig: json.RawMessage(`null`),
	}
	sb.ProposeConfig(player, proposal) // player proposes to the opponent
	sb.AcceptConfig(opponent) // opponent accepts (the game starts)
	sb.Unsubscribe(player) // player unsubscribes from the config room
	sb.Unsubscribe(opponent) // opponent unsubscribes from the config room
	sb.SubscribeGame(player, gameId) // player subscribes to the game
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
//
// func TestEndGame(t *testing.T) {
// 	sb, player, opponent, _ := setupTwoPlayersGame()
// 	sb.EndGame(player, opponent)
// 	sb.Cleanup()
// }
//
// func TestRejectProposal(t *testing.T) {
// 	sb, player, opponent, _ := setupTwoPlayersGame()
// 	sb.ProposeDraw(player)
// 	sb.RejectDraw(opponent)
// 	sb.Cleanup()
// }
//
// func TestAddTime(t *testing.T) {
// 	sb, player, _, _ := setupTwoPlayersGame()
// 	sb.AddTime(player)
// 	sb.Cleanup()
// }

func TestInvalidMessages(t *testing.T) {
	stopServer, _ := PrepareServer(t)
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
