package internal

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"testing"
	"time"

	"github.com/gorilla/websocket"

	everyboard "github.com/EveryBoard/EveryBoard/internal"
	"github.com/EveryBoard/EveryBoard/internal/model"
)

func encodeID(t *testing.T, id model.GameID) string {
	encodedId, err := model.EncodeID(id)
	if err != nil {
		t.Fatalf("cannot encode id: %v", err)
	}
	return encodedId
}
func b64(s string) string {
	return base64.RawStdEncoding.EncodeToString([]byte(s))
}

func tokenForUser(uid string) string {
	return fmt.Sprintf("Authorization, %s.%s.", b64("{}"), b64(fmt.Sprintf(`{"sub":"%s"}`, uid)))
}

func EstablishWebSocketConnection(t *testing.T, uid string) *websocket.Conn {
	headers := http.Header{}
	headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
	c, resp, err := websocket.DefaultDialer.Dial("ws://localhost:8081/ws", headers)
	if err != nil {
		t.Fatalf("Dial failed: %v (status %v)", err, resp.Status)
	}

	if resp.StatusCode != http.StatusSwitchingProtocols {
		t.Fatalf("Expected 101 Switching Protocols, got %d", resp.StatusCode)
	}

	// We should always receive a first message (about our current game)
	_, _, err = c.ReadMessage()
	if err != nil {
		t.Fatalf("cannot read message: %v", err)
	}

	return c
}

func sendMessage(t *testing.T, c *websocket.Conn, message string) {
	err := c.WriteMessage(websocket.TextMessage, []byte(message))
	if err != nil {
		t.Fatalf("cannot send message: %v", err)
	}
	// Wait a bit to make sure the message was correctly sent and processed
	time.Sleep(100 * time.Millisecond)
}

func readMessage[T any](t *testing.T, c *websocket.Conn, tag string, name string) T {
	done := make(chan struct{})
	var msgType int
	var msg []byte
	var err error

	go func() {
		msgType, msg, err = c.ReadMessage()
		close(done)
	}()
	select {
	case <-time.After(1 * time.Second):
		t.Fatalf("timeout: no message received within 1 second while waiting for message with tag %s", tag)
		panic("failed")
	case <-done:
		if err != nil {
			t.Fatalf("failed to read message: %v", err)
		}

		if msgType == -1 {
			t.Fatal("invalid message type")
		}

		var data []any
		err = json.Unmarshal(msg, &data)
		if err != nil {
			t.Fatalf("failed to unmarshall: %v", err)
		}

		if len(data) < 2 {
			t.Fatalf("not enough elements")
		}

		if gotTag, ok := data[0].(string); !ok || gotTag != tag {
			t.Fatalf("unexpected tag: %v", data[0])
		}

		obj, ok := data[1].(map[string]any)
		if !ok {
			t.Fatalf("invalid payload")
		}

		val, ok := obj[name].(T)
		if !ok {
			t.Fatalf("field %q missing or not string", name)
		}

		return val
	}
}

// Wait one second for a message, fail the test if nothing is received
func expectMessage(t *testing.T, c *websocket.Conn, expected string) {
	t.Helper()
	log.Printf("EXPECTED: %s", expected)
	done := make(chan struct{})
	var msgType int
	var msg []byte
	var err error

	go func() {
		msgType, msg, err = c.ReadMessage()
		close(done)
	}()

	select {
	case <-time.After(1 * time.Second):
		t.Fatalf("timeout: no message received within 1 second while waiting for %s", expected)
	case <-done:
		if err != nil {
			t.Fatalf("error when receiving response: %v", err)
		}
		if string(msg) != expected {
			t.Fatalf("response is not the expected one:\nexpected: `%s`\ngot     : `%s`", expected, string(msg))
		}
		if msgType == -1 {
			t.Fatal("invalid message type")
		}
		log.Printf("GOT:      %s", expected)
	}
}

func toJSON(t *testing.T, v any) string {
	b, err := json.Marshal(v)
	if err != nil {
		t.Fatalf("cannot convert to JSON: %v", err)
	}
	return string(b)
}

type ScenarioBuilder struct {
	t                *testing.T
	fakeStore        *FakeStore
	cleanupFunctions []func()

	connections           map[string]*websocket.Conn
	users                 map[string]model.MinimalUser
	lobbySubscribers      []string
	configRoomSubscribers map[model.GameID][]string
	gameSubscribers       map[model.GameID][]string
	subscriptions         map[string]model.GameID
}

func NewScenarioBuilder(t *testing.T) ScenarioBuilder {
	everyboard.Now = func() int64 { return 42 }
	everyboard.NowFloat = func() float64 { return 42 }
	everyboard.RandBool = func() bool { return true }

	stopServer, fakeStore := PrepareServer(t)
	return ScenarioBuilder{
		t:                     t,
		fakeStore:             fakeStore,
		cleanupFunctions:      []func(){stopServer},
		connections:           make(map[string]*websocket.Conn),
		users:                 make(map[string]model.MinimalUser),
		lobbySubscribers:      []string{},
		configRoomSubscribers: make(map[model.GameID][]string),
		gameSubscribers:       make(map[model.GameID][]string),
		subscriptions:         make(map[string]model.GameID),
	}
}

func (sb ScenarioBuilder) Cleanup() {
	for _, conn := range sb.connections {
		conn.Close()
	}
	for _, f := range sb.cleanupFunctions {
		f()
	}
}

func (sb ScenarioBuilder) EstablishConnection(userId string) string {
	conn := EstablishWebSocketConnection(sb.t, userId)
	sb.connections[userId] = conn
	sb.users[userId] = model.MinimalUser{ID: userId, Name: userId}
	return userId
}

func (sb ScenarioBuilder) getUser(userId string) model.MinimalUser {
	user, ok := sb.users[userId]
	if !ok {
		sb.t.Fatalf("no user: %s", userId)
	}
	return user
}

func (sb ScenarioBuilder) getConnection(userId string) *websocket.Conn {
	conn, ok := sb.connections[userId]
	if !ok {
		sb.t.Fatalf("no connection for: %s", userId)
	}
	return conn
}

func find(arr []string, value string) *int {
	for i, v := range arr {
		if v == value {
			return &i
		}
	}
	return nil
}

func (sb *ScenarioBuilder) removeLobbySubscription(userId string) {
	idx := find(sb.lobbySubscribers, userId)
	if idx == nil {
		sb.t.Fatalf("cannot find subscriber: %s", userId)
		return
	}
	sb.lobbySubscribers = append(sb.lobbySubscribers[0:*idx], sb.lobbySubscribers[*idx+1:]...)
}

func (sb ScenarioBuilder) isSubscribedToConfigRoom(userId string, gameId model.GameID) bool {
	idx := find(sb.configRoomSubscribers[gameId], userId)
	return idx != nil
}

func (sb ScenarioBuilder) removeConfigRoomSubscription(userId string, gameId model.GameID) {
	idx := find(sb.configRoomSubscribers[gameId], userId)
	if idx == nil {
		sb.t.Fatalf("cannot find subscriber: %s", userId)
		return
	}
	sb.configRoomSubscribers[gameId] = append(sb.configRoomSubscribers[gameId][0:*idx], sb.configRoomSubscribers[gameId][*idx+1:]...)
}

func (sb ScenarioBuilder) removeGameSubscription(userId string, gameId model.GameID) {
	idx := find(sb.gameSubscribers[gameId], userId)
	if idx == nil {
		sb.t.Fatalf("cannot find subscriber: %s", userId)
		return
	}
	sb.gameSubscribers[gameId] = append(sb.gameSubscribers[gameId][0:*idx], sb.gameSubscribers[gameId][*idx+1:]...)
}

func (sb ScenarioBuilder) getConfigRoomSubscribers(gameId model.GameID) []string {
	subscribers, ok := sb.configRoomSubscribers[gameId]
	if !ok {
		subscribers = []string{}
		sb.configRoomSubscribers[gameId] = subscribers
	}
	return subscribers
}

func (sb ScenarioBuilder) getGameSubscribers(gameId model.GameID) []string {
	subscribers, ok := sb.gameSubscribers[gameId]
	if !ok {
		subscribers = []string{}
		sb.gameSubscribers[gameId] = subscribers
	}
	return subscribers
}

func (sb ScenarioBuilder) getSubscribedGameId(userId string) model.GameID {
	subscription, ok := sb.subscriptions[userId]
	if !ok {
		sb.t.Fatalf("no subscription for %s", userId)
	}
	return subscription
}

func (sb ScenarioBuilder) subscribeConfigRoom(userId string, gameId model.GameID) {
	sb.subscriptions[userId] = gameId
	subscribers := sb.getConfigRoomSubscribers(gameId)
	sb.configRoomSubscribers[gameId] = append(subscribers, userId)
}

func (sb ScenarioBuilder) subscribeGame(userId string, gameId model.GameID) {
	sb.subscriptions[userId] = gameId
	subscribers := sb.getGameSubscribers(gameId)
	sb.gameSubscribers[gameId] = append(subscribers, userId)
}

func (sb ScenarioBuilder) getGame(gameId model.GameID) *model.Game {
	game, ok := sb.fakeStore.Games[gameId]
	if !ok {
		sb.t.Fatalf("game does not exist: %d", gameId)
	}
	return game
}

func (sb *ScenarioBuilder) SubscribeLobby(userId string) {
	conn := sb.getConnection(userId)
	sendMessage(sb.t, conn, `["SubscribeLobby"]`)
	sb.subscriptions[userId] = model.GameIDLobby
	sb.lobbySubscribers = append(sb.lobbySubscribers, userId)
}

func (sb ScenarioBuilder) Create(userId string, gameName string) model.GameID {
	conn := sb.getConnection(userId)

	sendMessage(sb.t, conn, fmt.Sprintf(`["Create",{"gameName":"%s"}]`, gameName))

	// After sendMessage, fakeStore has the new configRoom and currentGame
	gameId := sb.fakeStore.PeekNextID() - 1 // the last allocated ID is the one just created
	// Actually we need to find the configRoom that was just created
	// Since we know RandBool=true and creator goes first, gameId = nextID before Create
	// We find it by looking at the GameCreated message
	gameIdStr := readMessage[string](sb.t, conn, "GameCreated", "gameId")

	currentGame := sb.fakeStore.CurrentGames[userId]
	expectMessage(sb.t, conn, fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, currentGame)))

	// Decode the gameId from the string
	configRoom := sb.fakeStore.ConfigRooms[gameId]
	_ = gameIdStr
	configRoomJSON := toJSON(sb.t, configRoom)
	for _, subscriberId := range sb.getConfigRoomSubscribers(configRoom.ID) {
		expectMessage(sb.t, sb.getConnection(subscriberId), fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, gameIdStr, configRoomJSON))
	}
	for _, subscriberId := range sb.lobbySubscribers {
		expectMessage(sb.t, sb.getConnection(subscriberId), fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, gameIdStr, configRoomJSON))
	}
	return configRoom.ID
}

func (sb ScenarioBuilder) SubscribeConfigRoom(userId string, gameId model.GameID) {
	conn := sb.getConnection(userId)
	encodedGameId := encodeID(sb.t, gameId)

	sendMessage(sb.t, conn, fmt.Sprintf(`["SubscribeConfigRoom", {"gameId":"%s"}]`, encodedGameId))

	// After sendMessage, fakeStore has the new candidate and currentGame (if not creator)
	configRoom := sb.fakeStore.ConfigRooms[gameId]

	expectMessage(sb.t, conn, fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, encodedGameId, toJSON(sb.t, configRoom)))

	// Add userId to our local subscriber list BEFORE checking who receives CandidateJoined,
	// because the server subscribes the user before broadcasting CandidateJoined
	sb.subscribeConfigRoom(userId, gameId)

	user := sb.getUser(userId)
	if userId != configRoom.Creator.ID {
		// All configRoom subscribers (including the new one) see CandidateJoined
		for _, subscriber := range sb.getConfigRoomSubscribers(configRoom.ID) {
			expectMessage(sb.t, sb.getConnection(subscriber),
				fmt.Sprintf(`["CandidateJoined",{"candidate":%s,"elo":0}]`, toJSON(sb.t, user)))
		}
		// The new subscriber receives their CurrentGameUpdate
		currentGame := sb.fakeStore.CurrentGames[userId]
		expectMessage(sb.t, conn, fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, currentGame)))
	}
}

func (sb ScenarioBuilder) SubscribeGame(userId string, gameId model.GameID) {
	conn := sb.getConnection(userId)
	game := sb.getGame(gameId)

	encodedGameId := encodeID(sb.t, gameId)
	sendMessage(sb.t, conn, fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, encodedGameId))

	sb.subscribeGame(userId, gameId)

	isObserver := game.PlayerZero.ID != userId && game.PlayerOne.ID != userId
	if isObserver {
		currentGame := sb.fakeStore.CurrentGames[userId]
		expectMessage(sb.t, conn, fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, currentGame)))
	}
	expectMessage(sb.t, conn, fmt.Sprintf(`["GameUpdate",{"game":%s}]`, toJSON(sb.t, game)))

	events := sb.fakeStore.Events[gameId]
	for _, event := range events {
		expectMessage(sb.t, conn, fmt.Sprintf(`["GameEvent",{"event":%s,"serverTime":42}]`, toJSON(sb.t, event)))
	}
	syncEvent := model.GameEvent{
		Timestamp: 42,
		User:      sb.getUser(userId),
		Data:      model.EventDataSync,
	}
	expectMessage(sb.t, conn, fmt.Sprintf(`["GameEvent",{"event":%s,"serverTime":42}]`, toJSON(sb.t, syncEvent)))
}

func (sb ScenarioBuilder) Unsubscribe(userId string) {
	conn := sb.getConnection(userId)

	subscription, ok := sb.subscriptions[userId]
	if !ok {
		sb.t.Fatalf("cannot unsubscribe not subscribed user")
	}

	delete(sb.subscriptions, userId)

	if subscription == model.GameIDLobby {
		sb.removeLobbySubscription(userId)
	} else if sb.isSubscribedToConfigRoom(userId, subscription) {
		sb.removeConfigRoomSubscription(userId, subscription)
	} else {
		sb.removeGameSubscription(userId, subscription)
	}
	sendMessage(sb.t, conn, `["Unsubscribe"]`)
}

func (sb ScenarioBuilder) SelectOpponent(creator string, opponent string) {
	gameId := sb.getSubscribedGameId(creator)
	connCreator := sb.getConnection(creator)
	userOpponent := sb.getUser(opponent)

	sendMessage(sb.t, connCreator,
		fmt.Sprintf(`["SelectOpponent",{"opponent":%s}]`, toJSON(sb.t, userOpponent)))

	// After sendMessage, fakeStore has updated configRoom and currentGames
	configRoom := sb.fakeStore.ConfigRooms[gameId]
	currentGameCreator := sb.fakeStore.CurrentGames[creator]
	currentGameOpponent := sb.fakeStore.CurrentGames[opponent]

	expectMessage(sb.t, connCreator,
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, currentGameCreator)))
	expectMessage(sb.t, sb.getConnection(opponent),
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, currentGameOpponent)))

	encodedGameId := encodeID(sb.t, gameId)
	configRoomJSON := toJSON(sb.t, configRoom)
	for _, subscriber := range sb.getConfigRoomSubscribers(configRoom.ID) {
		expectMessage(sb.t, sb.getConnection(subscriber),
			fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, encodedGameId, configRoomJSON))
	}
}

func (sb ScenarioBuilder) ProposeConfig(userId string, proposal model.ConfigProposal) {
	connPlayer := sb.getConnection(userId)
	gameId := sb.getSubscribedGameId(userId)

	sendMessage(sb.t, connPlayer,
		fmt.Sprintf(`["ProposeConfig",{"config":%s}]`, toJSON(sb.t, proposal)))

	// After sendMessage, fakeStore has the updated configRoom
	configRoom := sb.fakeStore.ConfigRooms[gameId]
	encodedGameId := encodeID(sb.t, gameId)
	configRoomJSON := toJSON(sb.t, configRoom)
	for _, subscriber := range sb.getConfigRoomSubscribers(configRoom.ID) {
		expectMessage(sb.t, sb.getConnection(subscriber),
			fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, encodedGameId, configRoomJSON))
	}
}

func (sb ScenarioBuilder) ReviewConfig(userId string) {
	connPlayer := sb.getConnection(userId)
	gameId := sb.getSubscribedGameId(userId)

	sendMessage(sb.t, connPlayer, `["ReviewConfig"]`)

	configRoom := sb.fakeStore.ConfigRooms[gameId]
	encodedGameId := encodeID(sb.t, gameId)
	configRoomJSON := toJSON(sb.t, configRoom)
	for _, subscriber := range sb.getConfigRoomSubscribers(configRoom.ID) {
		expectMessage(sb.t, sb.getConnection(subscriber),
			fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, encodedGameId, configRoomJSON))
	}
}

func (sb ScenarioBuilder) AcceptConfig(userId string) {
	gameId := sb.getSubscribedGameId(userId)
	configRoom := sb.fakeStore.ConfigRooms[gameId]
	userCreator := configRoom.Creator
	userOpponent := *configRoom.ChosenOpponent

	sendMessage(sb.t, sb.getConnection(userId), `["AcceptConfig"]`)

	// After sendMessage, fakeStore has: configRoom.Status=Started, game created, events added, currentGames updated
	currentGameCreator := sb.fakeStore.CurrentGames[userCreator.ID]
	currentGameOpponent := sb.fakeStore.CurrentGames[userOpponent.ID]

	expectMessage(sb.t, sb.getConnection(userCreator.ID), fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, currentGameCreator)))
	expectMessage(sb.t, sb.getConnection(userOpponent.ID), fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, currentGameOpponent)))

	encodedGameId := encodeID(sb.t, gameId)
	configRoomJSON := toJSON(sb.t, configRoom)
	for _, subscriber := range sb.getConfigRoomSubscribers(configRoom.ID) {
		expectMessage(sb.t, sb.getConnection(subscriber),
			fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":%s}]`, encodedGameId, configRoomJSON))
	}
}

func (sb ScenarioBuilder) doEvent(userId string, eventStr string) {
	conn := sb.getConnection(userId)
	gameId := sb.getSubscribedGameId(userId)

	eventsBefore := len(sb.fakeStore.Events[gameId])
	sendMessage(sb.t, conn, eventStr)

	events := sb.fakeStore.Events[gameId]
	event := events[eventsBefore]
	eventJSON := toJSON(sb.t, &event)
	for _, subscriber := range sb.gameSubscribers[gameId] {
		expectMessage(sb.t, sb.getConnection(subscriber), fmt.Sprintf(`["GameEvent",{"event":%s,"serverTime":42}]`, eventJSON))
	}
}

func (sb ScenarioBuilder) Move(userId string, move json.RawMessage) {
	sb.doEvent(userId, fmt.Sprintf(`["Move",{"move":%s}]`, toJSON(sb.t, move)))
}

func (sb ScenarioBuilder) ProposeDraw(userId string) {
	sb.doEvent(userId, `["Propose",{"proposition":"Draw"}]`)
}

func (sb ScenarioBuilder) RejectDraw(userId string) {
	sb.doEvent(userId, `["Reject",{"proposition":"Draw"}]`)
}

func (sb ScenarioBuilder) AddTime(userId string) {
	sb.doEvent(userId, `["AddTime",{"kind":"Move"}]`)
}

func (sb ScenarioBuilder) endGameMessageExpectations(gameId model.GameID, endGameEvent model.GameEvent) {
	game := sb.fakeStore.Games[gameId]
	// CurrentGameUpdate(null) for each subscriber (in the order the server sends them: playerZero, playerOne, observers)
	for _, subscriber := range sb.gameSubscribers[gameId] {
		expectMessage(sb.t, sb.getConnection(subscriber), `["CurrentGameUpdate",{"currentGame":null}]`)
	}
	gameJSON := toJSON(sb.t, game)
	endGameJSON := toJSON(sb.t, &endGameEvent)
	for _, subscriber := range sb.gameSubscribers[gameId] {
		conn := sb.getConnection(subscriber)
		expectMessage(sb.t, conn, fmt.Sprintf(`["GameUpdate",{"game":%s}]`, gameJSON))
		expectMessage(sb.t, conn, fmt.Sprintf(`["GameEvent",{"event":%s,"serverTime":42}]`, endGameJSON))
	}
}

func (sb ScenarioBuilder) AcceptDraw(userId string) {
	gameId := sb.getSubscribedGameId(userId)
	eventsBefore := len(sb.fakeStore.Events[gameId])

	sendMessage(sb.t, sb.getConnection(userId), `["Accept",{"proposition":"Draw"}]`)

	events := sb.fakeStore.Events[gameId]
	acceptEvent := events[eventsBefore]
	endGameEvent := events[eventsBefore+1]

	// First the accept event is broadcast
	acceptJSON := toJSON(sb.t, &acceptEvent)
	for _, subscriber := range sb.gameSubscribers[gameId] {
		expectMessage(sb.t, sb.getConnection(subscriber), fmt.Sprintf(`["GameEvent",{"event":%s,"serverTime":42}]`, acceptJSON))
	}

	// Then end game messages
	sb.endGameMessageExpectations(gameId, endGameEvent)
}

func (sb ScenarioBuilder) endGame(userId string, message string) {
	gameId := sb.getSubscribedGameId(userId)
	eventsBefore := len(sb.fakeStore.Events[gameId])

	sendMessage(sb.t, sb.getConnection(userId), message)

	events := sb.fakeStore.Events[gameId]
	endGameEvent := events[eventsBefore]

	sb.endGameMessageExpectations(gameId, endGameEvent)
}

func (sb ScenarioBuilder) Resign(userId string) {
	sb.endGame(userId, `["Resign"]`)
}

func (sb ScenarioBuilder) NotifyTimeout(notifier string) {
	sb.endGame(notifier, `["NotifyTimeout",{"timeoutedPlayer":1}]`)
}

func (sb ScenarioBuilder) EndGame(userId string, winner int) {
	sb.endGame(userId, fmt.Sprintf(`["EndGame",{"winner":%d}]`, winner))
}

func (sb ScenarioBuilder) ProposeRematch(userId string) {
	sb.doEvent(userId, `["Propose",{"proposition":"Rematch"}]`)
}

func (sb ScenarioBuilder) AcceptRematch(userId string) model.GameID {
	creator := sb.getUser(userId)
	gameId := sb.getSubscribedGameId(userId)

	// Peek at what the rematch ID will be
	rematchId := sb.fakeStore.PeekNextID()

	eventsBefore := len(sb.fakeStore.Events[gameId])

	sendMessage(sb.t, sb.getConnection(userId), `["Accept", {"proposition":"Rematch"}]`)

	// After sendMessage:
	// - rematch configRoom created (rematchId)
	// - rematch game created
	// - currentGames for both players updated to rematch game
	// - StartGame event added to rematch game
	// - AcceptRematch event added to current game

	_ = rematchId
	_ = eventsBefore

	currentGameCreator := sb.fakeStore.CurrentGames[creator.ID]

	// Find the opponent from the rematch game
	var opponentId string
	rematchGame := sb.fakeStore.Games[rematchId]
	if rematchGame.PlayerZero.ID == creator.ID {
		opponentId = rematchGame.PlayerOne.ID
	} else {
		opponentId = rematchGame.PlayerZero.ID
	}
	currentGameOpponent := sb.fakeStore.CurrentGames[opponentId]

	expectMessage(sb.t, sb.getConnection(creator.ID),
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, currentGameCreator)))
	expectMessage(sb.t, sb.getConnection(opponentId),
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":%s}]`, toJSON(sb.t, currentGameOpponent)))

	// The accept rematch event in the current game
	events := sb.fakeStore.Events[gameId]
	acceptRematchEvent := events[len(events)-1]
	acceptRematchJSON := toJSON(sb.t, &acceptRematchEvent)
	expectMessage(sb.t, sb.getConnection(creator.ID),
		fmt.Sprintf(`["GameEvent",{"event":%s,"serverTime":42}]`, acceptRematchJSON))
	expectMessage(sb.t, sb.getConnection(opponentId),
		fmt.Sprintf(`["GameEvent",{"event":%s,"serverTime":42}]`, acceptRematchJSON))

	return rematchId
}
