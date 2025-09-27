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
	sb.SelectOpponent(gameId, player, opponent) // player selects the opponent
	// sb.ProposeConfig(player) // player proposes to the opponent
	// sb.ReviewConfig(player) // player reviews the config
	// sb.ProposeConfig(player) // player proposes the config again
	// sb.AcceptConfig(opponent) // opponent accepts (the game starts)
	// observer := sb.EstablishConnection("observer") // an observer joins
	// sb.SubscribeConfigRoom(observer, gameId) // the observer subscribes to the game
	// sb.Move(player,  map[string]int{"x": 42}) // player plays one move
	// sb.ProposeDraw(opponent)// opponent proposes draw
	// sb.AcceptDraw(player) // player accepts

	sb.Cleanup()
	t.Fatalf("test")
}

func TestGameFlow(t *testing.T) {
	everyboard.Now = func() int64 {
		return 42
	}
	everyboard.NowFloat = func() float64 {
		return 42.
	}

	stopServer, mock := PrepareServer(t)
	defer stopServer()

	player := EstablishWebSocketConnection(t, "player")
	defer player.Close()

	opponent := EstablishWebSocketConnection(t, "opponent")
	defer opponent.Close()

	observer := EstablishWebSocketConnection(t, "observer")
	defer observer.Close()

	userPlayer := model.MinimalUser{ID: "player", Name: "player"}
	configRoom := model.ConfigRoom{
		ID: 2,
		Creator: userPlayer,
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

	// Opponent opens lobby
	ExpectMessageSelection(mock, 1, []model.Message{})
	ExpectInGameConfigRoomSelection(mock, []model.ConfigRoom{})
	sendMessage(t, opponent, `["SubscribeLobby"]`)

	// Player creates the game and is notified, while opponent receives the update
	ExpectEloSelection(mock, "player", "P4", nil)
	eloPlayer := model.Elo{
		ID: 1,
		User: userPlayer,
		GameName: "P4",
		CurrentElo: 0,
		GamesPlayed: 0,
	}
	ExpectEloInsertion(mock, eloPlayer)
	ExpectConfigRoomInsertion(mock, configRoom)
	currentGamePlayer := model.CurrentGame{
		ID: 1,
		User: userPlayer,
		GameID: configRoom.ID,
		GameName: "P4",
		Creator: userPlayer,
		Opponent: nil,
		Role: model.UserRoleCreator,
	}
	ExpectCurrentGameInsertion(mock, currentGamePlayer)
	sendMessage(t, player, `["Create",{"gameName":"P4"}]`)
	gameId := readMessage[string](t, player, "GameCreated", "gameId")
	expectMessage(t, player,
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":{"id":"%s","gameName":"P4","creator":{"id":"player","name":"player"},"opponent":null,"role":"Creator"}}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":null,"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))

	// Player needs to subscribe to the config room
	ExpectSpecificConfigRoomSelection(mock, configRoom)
	ExpectCandidateSelection(mock, 2, []model.Candidate{})

	sendMessage(t, player, fmt.Sprintf(`["SubscribeConfigRoom", {"gameId":"%s"}]`, gameId))
	expectMessage(t, player,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":null,"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))

	// Opponent subscribes to the config room and gets the update. They need first to unsubscribe from the lobby
	sendMessage(t, opponent, `["Unsubscribe"]`)
	userOpponent := model.MinimalUser{
		ID: "opponent",
		Name: "opponent",
	}

	ExpectSpecificConfigRoomSelection(mock, configRoom)
	ExpectCandidateInsertion(mock, model.Candidate{
		ID: 1,
		GameID: configRoom.ID,
		User: userOpponent,
		Elo: 0,
	})
	currentGameOpponent := model.CurrentGame{
		ID: 2,
		User: userOpponent,
		GameID: configRoom.ID,
		GameName: "P4",
		Creator: userPlayer,
		Opponent: nil,
		Role: model.UserRoleCandidate,
	}
	ExpectCurrentGameInsertion(mock, currentGameOpponent)
	candidateOpponent := model.Candidate{
		ID: 1,
		GameID: configRoom.ID,
		User: userOpponent,
		Elo: 0,
	}
	ExpectCandidateSelection(mock, configRoom.ID, []model.Candidate{candidateOpponent})

	sendMessage(t, opponent, fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":null,"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))

	// Both see the opponent arrive
	expectMessage(t, player, `["CandidateJoined",{"candidate":{"id":"opponent","name":"opponent"}}]`)
	expectMessage(t, opponent, `["CandidateJoined",{"candidate":{"id":"opponent","name":"opponent"}}]`)

	// Opponent has their current game updated
	expectMessage(t, opponent,
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":{"id":"%s","gameName":"P4","creator":{"id":"player","name":"player"},"opponent":null,"role":"Candidate"}}]`, gameId))

	// Player selects the opponent
	ExpectSpecificConfigRoomSelection(mock, configRoom)
	configRoom.ChosenOpponent = &userOpponent
	ExpectConfigRoomUpdateSelectOpponent(mock, configRoom)
	currentGamePlayer.Opponent = &userOpponent
	ExpectCurrentGameUpdate(mock, currentGamePlayer)
	currentGameOpponent.Opponent = &userOpponent
	currentGameOpponent.Role = model.UserRoleChosenOpponent
	ExpectCurrentGameUpdate(mock, currentGameOpponent)
	sendMessage(t, player, `["SelectOpponent",{"opponent":{"id":"opponent","name":"opponent"}}]`)
	expectMessage(t, player,
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":{"id":"%s","gameName":"P4","creator":{"id":"player","name":"player"},"opponent":{"id":"opponent","name":"opponent"},"role":"Creator"}}]`, gameId))
	expectMessage(t, player,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))

	expectMessage(t, opponent,
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":{"id":"%s","gameName":"P4","creator":{"id":"player","name":"player"},"opponent":{"id":"opponent","name":"opponent"},"role":"ChosenOpponent"}}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))

	// Player proposes to opponent
	ExpectSpecificConfigRoomSelection(mock, configRoom)
	configRoom.Status = model.StatusConfigProposed
	configRoom.FirstPlayer = model.FirstPlayerCreator
	ExpectConfigRoomUpdateProposeConfig(mock, configRoom)
	sendMessage(t, player, `["ProposeConfig",{"config":{"gameType":"Standard","moveDuration":120,"gameDuration":1800,"firstPlayer":"Creator","rulesConfig":null}}]`)
	expectMessage(t, player,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"ConfigProposed","firstPlayer":"Creator","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"ConfigProposed","firstPlayer":"Creator","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))

	// Player reviews config
	ExpectSpecificConfigRoomSelection(mock, configRoom)
	configRoom.Status = model.StatusCreated
	ExpectConfigRoomUpdateStatus(mock, configRoom)
	sendMessage(t, player, `["ReviewConfig"]`)
	expectMessage(t, player,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"Created","firstPlayer":"Creator","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"Created","firstPlayer":"Creator","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))

	// Player proposes config again
	ExpectSpecificConfigRoomSelection(mock, configRoom)
	configRoom.Status = model.StatusConfigProposed
	ExpectConfigRoomUpdateProposeConfig(mock, configRoom)
	sendMessage(t, player, `["ProposeConfig",{"config":{"gameType":"Standard","moveDuration":120,"gameDuration":1800,"firstPlayer":"Creator","rulesConfig":null}}]`)
	expectMessage(t, player,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"ConfigProposed","firstPlayer":"Creator","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"ConfigProposed","firstPlayer":"Creator","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))

	// Opponent accepts and game starts, so each player has to unsubscribe to the config room and subscribe to the game
	ExpectSpecificConfigRoomSelection(mock, configRoom)
	configRoom.Status = model.StatusStarted
	ExpectConfigRoomUpdateStatus(mock, configRoom)

	game := model.Game{
		GameID: 2,
		GameName: "P4",
		PlayerZero: userPlayer,
		PlayerOne: userOpponent,
		Result: model.ResultInProgress,
		Beginning: 42,
	}
	ExpectGameInsertion(mock, game)
	eventStartGame := model.GameEvent{
		ID: 1,
		GameID: configRoom.ID,
		Timestamp: 42,
		User: userOpponent,
		Data: model.EventDataStartGame,
	}
	ExpectEventInsertion(mock, eventStartGame)
	ExpectCandidateSelection(mock, configRoom.ID, []model.Candidate{candidateOpponent})
	currentGamePlayer.Role = model.UserRolePlayer
	ExpectCurrentGameUpdate(mock, currentGamePlayer)
	currentGameOpponent.Role = model.UserRolePlayer
	ExpectCurrentGameUpdate(mock, currentGameOpponent)

	sendMessage(t, opponent, `["AcceptConfig"]`)
	expectMessage(t, player,
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":{"id":"%s","gameName":"P4","creator":{"id":"player","name":"player"},"opponent":{"id":"opponent","name":"opponent"},"role":"Player"}}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":{"id":"%s","gameName":"P4","creator":{"id":"player","name":"player"},"opponent":{"id":"opponent","name":"opponent"},"role":"Player"}}]`, gameId))
	expectMessage(t, player,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"Started","firstPlayer":"Creator","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"Started","firstPlayer":"Creator","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))

	ExpectSpecificConfigRoomSelection(mock, configRoom)
	sendMessage(t, player, `["Unsubscribe"]`)
	ExpectSpecificConfigRoomSelection(mock, configRoom)
	sendMessage(t, opponent, `["Unsubscribe"]`)

	ExpectSpecificGameSelection(mock, game)
	ExpectMessageSelection(mock, configRoom.ID, []model.Message{})
	ExpectEventSelection(mock, configRoom.ID, []model.GameEvent{eventStartGame})
	sendMessage(t, player, fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, gameId))
	expectMessage(t, player, `["GameUpdate",{"game":{"gameName":"P4","playerZero":{"id":"player","name":"player"},"playerOne":{"id":"opponent","name":"opponent"},"result":"InProgress","beginning":42}}]`)
	expectMessage(t, player, `["GameEvent",{"event":{"action":"StartGame","eventType":"Action","time":42,"user":{"id":"opponent","name":"opponent"}},"serverTime":42}]`)
	expectMessage(t, player, `["GameEvent",{"event":{"action":"Sync","eventType":"Action","time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)

	ExpectSpecificGameSelection(mock, game)
	ExpectMessageSelection(mock, configRoom.ID, []model.Message{})
	ExpectEventSelection(mock, configRoom.ID, []model.GameEvent{eventStartGame})
	sendMessage(t, opponent, fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, gameId))
	expectMessage(t, opponent, `["GameUpdate",{"game":{"gameName":"P4","playerZero":{"id":"player","name":"player"},"playerOne":{"id":"opponent","name":"opponent"},"result":"InProgress","beginning":42}}]`)
	expectMessage(t, opponent, `["GameEvent",{"event":{"action":"StartGame","eventType":"Action","time":42,"user":{"id":"opponent","name":"opponent"}},"serverTime":42}]`)
	expectMessage(t, opponent, `["GameEvent",{"event":{"action":"Sync","eventType":"Action","time":42,"user":{"id":"opponent","name":"opponent"}},"serverTime":42}]`)

	// An observer also subscribes to the game
	ExpectSpecificGameSelection(mock, game)
	ExpectSpecificConfigRoomSelection(mock, configRoom)
	userObserver := model.MinimalUser{ID: "observer", Name: "observer"}
	currentGameObserver := model.CurrentGame{
		ID: 1,
		User: userObserver,
		GameID: configRoom.ID,
		GameName: "P4",
		Creator: userPlayer,
		Opponent: &userOpponent,
		Role: model.UserRoleObserver,
	}
	ExpectCurrentGameInsertion(mock, currentGameObserver)
	ExpectMessageSelection(mock, configRoom.ID, []model.Message{})
	ExpectEventSelection(mock, configRoom.ID, []model.GameEvent{eventStartGame})
	sendMessage(t, observer, fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, gameId))
	expectMessage(t, observer,
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":{"id":"%s","gameName":"P4","creator":{"id":"player","name":"player"},"opponent":{"id":"opponent","name":"opponent"},"role":"Observer"}}]`, gameId))
	expectMessage(t, observer, `["GameUpdate",{"game":{"gameName":"P4","playerZero":{"id":"player","name":"player"},"playerOne":{"id":"opponent","name":"opponent"},"result":"InProgress","beginning":42}}]`)
	expectMessage(t, observer, `["GameEvent",{"event":{"action":"StartGame","eventType":"Action","time":42,"user":{"id":"opponent","name":"opponent"}},"serverTime":42}]`)
	expectMessage(t, observer, `["GameEvent",{"event":{"action":"Sync","eventType":"Action","time":42,"user":{"id":"observer","name":"observer"}},"serverTime":42}]`)

	// Player plays one move
	eventMove := model.GameEvent{
		ID: 2,
		GameID: configRoom.ID,
		Timestamp: 42,
		User: userPlayer,
		Data: model.EventDataMove(json.RawMessage(`{"x":42}`)),
	}
	ExpectEventInsertion(mock, eventMove)
	sendMessage(t, player, `["Move",{"move":{"x":42}}]`)
	expectMessage(t, player, `["GameEvent",{"event":{"eventType":"Move","move":{"x":42},"time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)
	expectMessage(t, opponent, `["GameEvent",{"event":{"eventType":"Move","move":{"x":42},"time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)
	expectMessage(t, observer, `["GameEvent",{"event":{"eventType":"Move","move":{"x":42},"time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)

	// Opponent proposes draw
	eventProposeDraw := model.GameEvent{
		ID: 2,
		GameID: configRoom.ID,
		Timestamp: 42,
		User: userOpponent,
		Data: model.EventDataRequest(model.PropositionDraw),
	}
	ExpectEventInsertion(mock, eventProposeDraw)
	sendMessage(t, opponent, `["Propose",{"proposition":"Draw"}]`)
	expectMessage(t, player, `["GameEvent",{"event":{"eventType":"Request","requestType":"Draw","time":42,"user":{"id":"opponent","name":"opponent"}},"serverTime":42}]`)
	expectMessage(t, opponent, `["GameEvent",{"event":{"eventType":"Request","requestType":"Draw","time":42,"user":{"id":"opponent","name":"opponent"}},"serverTime":42}]`)
	expectMessage(t, observer, `["GameEvent",{"event":{"eventType":"Request","requestType":"Draw","time":42,"user":{"id":"opponent","name":"opponent"}},"serverTime":42}]`)

	// Player accepts, and game ends
	ExpectSpecificConfigRoomSelection(mock, configRoom)
	ExpectSpecificGameSelection(mock, game)
	game.Result = model.ResultAgreedDrawByZero
	ExpectGameUpdateSetResult(mock, game)
	eventEndGame := model.GameEvent{
		ID: 3,
		GameID: configRoom.ID,
		Timestamp: 42,
		User: userPlayer,
		Data: model.EventDataEndGame,
	}
	ExpectEventInsertion(mock, eventEndGame)
	ExpectEloSelection(mock, userPlayer.ID, configRoom.GameName, &eloPlayer)
	ExpectEloSelection(mock, userOpponent.ID, configRoom.GameName, nil) // Elo opponent has not been created before
	eloOpponent := model.Elo{
		ID: 2,
		User: userOpponent,
		GameName: "P4",
		CurrentElo: 0,
		GamesPlayed: 0,
	}
	ExpectEloInsertion(mock, eloOpponent)
	eloPlayer.CurrentElo = 1
	eloPlayer.GamesPlayed = 1
	eloOpponent.CurrentElo = 1
	eloOpponent.GamesPlayed = 1
	ExpectEloUpdates(mock, eloPlayer, eloOpponent)
	configRoom.Status = model.StatusFinished
	ExpectConfigRoomUpdateStatus(mock, configRoom)
	ExpectCurrentGameDelete(mock, userPlayer.ID)
	ExpectCurrentGameDelete(mock, userOpponent.ID)
	ExpectCurrentGameSelectObservers(mock, configRoom.ID, []model.CurrentGame{currentGameObserver})
	ExpectCurrentGameDelete(mock, userObserver.ID)
	eventAcceptDraw := model.GameEvent{
		ID: 4,
		GameID: configRoom.ID,
		Timestamp: 42,
		User: userPlayer,
		Data: model.EventDataReplyAccept(model.PropositionDraw, nil),
	}
	ExpectEventInsertion(mock, eventAcceptDraw)
	mock.ExpectBegin()
	sendMessage(t, player, `["Accept",{"proposition":"Draw"}]`)
	expectMessage(t, opponent, `["CurrentGameUpdate",{"currentGame":null}]`)
	expectMessage(t, player, `["CurrentGameUpdate",{"currentGame":null}]`)
	expectMessage(t, observer, `["CurrentGameUpdate",{"currentGame":null}]`)
	expectMessage(t, observer, `["GameUpdate",{"game":{"gameName":"P4","playerZero":{"id":"player","name":"player"},"playerOne":{"id":"opponent","name":"opponent"},"result":"AgreedDrawByZero","beginning":42}}]`)
	expectMessage(t, observer, `["GameEvent",{"event":{"action":"EndGame","eventType":"Action","time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)
	expectMessage(t, observer, `["GameEvent",{"event":{"accept":true,"eventType":"Reply","requestType":"Draw","time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)
	expectMessage(t, player, `["GameUpdate",{"game":{"gameName":"P4","playerZero":{"id":"player","name":"player"},"playerOne":{"id":"opponent","name":"opponent"},"result":"AgreedDrawByZero","beginning":42}}]`)
	expectMessage(t, player, `["GameEvent",{"event":{"action":"EndGame","eventType":"Action","time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)
	expectMessage(t, player, `["GameEvent",{"event":{"accept":true,"eventType":"Reply","requestType":"Draw","time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)
	expectMessage(t, opponent, `["GameUpdate",{"game":{"gameName":"P4","playerZero":{"id":"player","name":"player"},"playerOne":{"id":"opponent","name":"opponent"},"result":"AgreedDrawByZero","beginning":42}}]`)
	expectMessage(t, opponent, `["GameEvent",{"event":{"action":"EndGame","eventType":"Action","time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)
	expectMessage(t, opponent, `["GameEvent",{"event":{"accept":true,"eventType":"Reply","requestType":"Draw","time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)
}

func TestResign(t *testing.T) {
	// player, opponent := setupGameWithTwoPlayers()
}

// TODO: TestNotifyTimeout
// TODO: TestEndGame with a winner
// TODO: TestRejectProposal
// TODO: TestAddTime

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
