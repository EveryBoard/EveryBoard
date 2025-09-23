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
)

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

func TestSubscribeToLobbyShouldSubscribe(t *testing.T) {
	stopServer := PrepareServer(t)
	defer stopServer()

	// Given an established connection
	c := EstablishWebSocketConnection(t, "foo")
	defer c.Close()

	// When subscribing to lobby
	c.WriteMessage(websocket.TextMessage, []byte(`["SubscribeLobby"]`))
	time.Sleep(100 * time.Millisecond)

	// Then we should should be subscribed
	if !everyboard.Subscriptions.IsSubscribed("foo") {
		t.Fatalf("user should be subscribed")
	}
}

func sendMessage(t *testing.T, c *websocket.Conn, message string) {
	err := c.WriteMessage(websocket.TextMessage, []byte(message))
	if err != nil {
		t.Fatalf("cannot send message: %v", err)
	}
}

func debugMessage(t *testing.T, c *websocket.Conn) {
	_, message, _ := c.ReadMessage()
	log.Printf("!!!!!!!!!!!!!!!!!!!>>>>> %s", string(message))
}

func readMessage[T interface{}](t *testing.T, c *websocket.Conn, tag string, name string) T {
	_, message, err := c.ReadMessage()
	if err != nil {
		t.Fatalf("failed to read message: %v", err)
	}

	var data []interface{}
	err = json.Unmarshal(message, &data)
	if err != nil  {
		t.Fatalf("failed to unmarshall: %v", err)
	}

	if len(data) < 2 {
		t.Fatalf("not enough elements")
	}

	if gotTag, ok := data[0].(string); !ok || gotTag != tag {
		t.Fatalf("unexpected tag: %v", data[0])
	}

	obj, ok := data[1].(map[string]interface{})
	if !ok {
		t.Fatalf("invalid payload")
	}

	val, ok := obj[name].(T)
	if !ok {
		t.Fatalf("field %q missing or not string", name)
	}

	return val
}

// Wait one second for a message, fail the test if nothing is received
// TODO: doesn't really seem to wait one second and instead it hangs
func expectMessage(t *testing.T, c *websocket.Conn, expected string) {
	done := make(chan struct{})
	var msgType int
	var msg []byte
	var err error

	go func() {
		log.Println("reading...")
		msgType, msg, err = c.ReadMessage()
		log.Printf("read %d", msgType)
		close(done)
	}()

	select {
	case <-time.After(1 * time.Second):
		log.Println("timeout")
		t.Fatal("timeout: no message received within 1 second")
	case <-done:
		log.Println("DONE")
		if err != nil {
			t.Fatalf("error when receiving response: %v", err)
		}
		if string(msg) != expected {
			t.Fatalf("response is not the expected one:\nexpected: `%s`\ngot     : `%s`", expected, string(msg))
		}
		if msgType == -1 {
			t.Fatal("invalid message type")
		}
	}
}

func toJSON(t *testing.T, v interface{}) string {
	b, err := json.Marshal(v)
	if err != nil {
		t.Fatalf("cannot convert to JSON: %v", err)
	}
	return string(b)
}

func TestSubscribeToLobbyWithMessagesAndConfigRooms(t *testing.T) {
	everyboard.Now = func() int64 {
		return 42
	}
	stopServer := PrepareServer(t)
	defer stopServer()

	// Given an established connection to a server with a config room and a lobby message
	otherConnection := EstablishWebSocketConnection(t, "foo")
	defer otherConnection.Close()

	sendMessage(t, otherConnection, `["SubscribeLobby"]`)
	sendMessage(t, otherConnection, `["ChatSend",{"message":"hello"}]`)
	sendMessage(t, otherConnection, `["Unsubscribe"]`)

	sendMessage(t, otherConnection, `["Create", {"gameName":"P4"}]`)

	// When subscribing to the lobby
	c := EstablishWebSocketConnection(t, "bar")
	defer c.Close()

	sendMessage(t, c, `["SubscribeLobby"]`)

	// Then we should receive one message for the chat message and one for the config room
	expectMessage(t, c, `["ChatMessage",{"message":{"sender":{"id":"foo","name":"foo"},"timestamp":42,"content":"hello"}}]`)
	expectMessage(t, c, `["ConfigRoomUpdate",{"gameId":"gbHJd","configRoom":{"creator":{"id":"foo","name":"foo"},"creatorElo":0,"chosenOpponent":null,"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`)
}

 func TestGameFlow(t *testing.T) {
	everyboard.Now = func() int64 {
		return 42
	}
	everyboard.NowFloat = func() float64 {
		return 42.
	}

	// TODO: problem, the DB seems to be shared among all processes!
 	stopServer := PrepareServer(t)
 	defer stopServer()

 	player := EstablishWebSocketConnection(t, "player")
 	defer player.Close()

 	opponent := EstablishWebSocketConnection(t, "opponent")
 	defer opponent.Close()

 	observer := EstablishWebSocketConnection(t, "observer")
 	defer observer.Close()

	// Opponent opens lobby
 	sendMessage(t, opponent, `["SubscribeLobby"]`)
	// Player creates the game and is notified, while opponent receives the update
 	sendMessage(t, player, `["Create",{"gameName":"P4"}]`)
 	gameId := readMessage[string](t, player, "GameCreated", "gameId")
 	expectMessage(t, player,
 	 	fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":{"id":"%s","gameName":"P4","opponent":null,"role":"Creator"}}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":null,"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))
	// Player needs to subscribe to the config room
	sendMessage(t, player, fmt.Sprintf(`["SubscribeConfigRoom", {"gameId":"%s"}]`, gameId))
	expectMessage(t, player,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":null,"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))

	// Opponent subscribes to the config room and gets the update. They need first to unsubscribe from the lobby
 	sendMessage(t, opponent, `["Unsubscribe"]`)
 	sendMessage(t, opponent, fmt.Sprintf(`["SubscribeConfigRoom",{"gameId":"%s"}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":null,"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))

	// Both see the opponent arrive
 	expectMessage(t, player, `["CandidateJoined",{"candidate":{"id":"opponent","name":"opponent"}}]`)
	expectMessage(t, opponent, `["CandidateJoined",{"candidate":{"id":"opponent","name":"opponent"}}]`)

	// Opponent has their current game updated
	expectMessage(t, opponent,
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":{"id":"%s","gameName":"P4","opponent":{"id":"player","name":"player"},"role":"Candidate"}}]`, gameId))

	// Player selects the opponent
	sendMessage(t, player, `["SelectOpponent",{"opponent":{"id":"opponent","name":"opponent"}}]`)
	expectMessage(t, player,
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":{"id":"%s","gameName":"P4","opponent":{"id":"opponent","name":"opponent"},"role":"Creator"}}]`, gameId))
	expectMessage(t, player,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))

	expectMessage(t, opponent,
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":{"id":"%s","gameName":"P4","opponent":{"id":"player","name":"player"},"role":"ChosenOpponent"}}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1800,"rulesConfig":null,"gameName":"P4"}}]`, gameId))

	// Player proposes to opponent
	sendMessage(t, player, `["ProposeConfig",{"config":{"gameType":"Standard","moveDuration":30,"gameDuration":1800,"firstPlayer":"Creator","rulesConfig":{}}}]`)
	expectMessage(t, player,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"ConfigProposed","firstPlayer":"Creator","gameType":"Standard","moveDuration":30,"gameDuration":1800,"rulesConfig":{},"gameName":"P4"}}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"ConfigProposed","firstPlayer":"Creator","gameType":"Standard","moveDuration":30,"gameDuration":1800,"rulesConfig":{},"gameName":"P4"}}]`, gameId))

	// Player reviews config
	sendMessage(t, player, `["ReviewConfig"]`)
	expectMessage(t, player,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"Created","firstPlayer":"Creator","gameType":"Standard","moveDuration":30,"gameDuration":1800,"rulesConfig":{},"gameName":"P4"}}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"Created","firstPlayer":"Creator","gameType":"Standard","moveDuration":30,"gameDuration":1800,"rulesConfig":{},"gameName":"P4"}}]`, gameId))

	// Player proposes config again
	sendMessage(t, player, `["ProposeConfig",{"config":{"gameType":"Standard","moveDuration":30,"gameDuration":1800,"firstPlayer":"Creator","rulesConfig":{}}}]`)
	expectMessage(t, player,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"ConfigProposed","firstPlayer":"Creator","gameType":"Standard","moveDuration":30,"gameDuration":1800,"rulesConfig":{},"gameName":"P4"}}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"ConfigProposed","firstPlayer":"Creator","gameType":"Standard","moveDuration":30,"gameDuration":1800,"rulesConfig":{},"gameName":"P4"}}]`, gameId))

	// Opponent accepts and game starts, so each player has to unsubscribe to the config room and subscribe to the game
	sendMessage(t, opponent, `["AcceptConfig"]`)
	expectMessage(t, player,
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":{"id":"%s","gameName":"P4","opponent":{"id":"opponent","name":"opponent"},"role":"Player"}}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["CurrentGameUpdate",{"currentGame":{"id":"%s","gameName":"P4","opponent":{"id":"player","name":"player"},"role":"Player"}}]`, gameId))
	expectMessage(t, player,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"Started","firstPlayer":"Creator","gameType":"Standard","moveDuration":30,"gameDuration":1800,"rulesConfig":{},"gameName":"P4"}}]`, gameId))
	expectMessage(t, opponent,
		fmt.Sprintf(`["ConfigRoomUpdate",{"gameId":"%s","configRoom":{"creator":{"id":"player","name":"player"},"creatorElo":0,"chosenOpponent":{"id":"opponent","name":"opponent"},"status":"Started","firstPlayer":"Creator","gameType":"Standard","moveDuration":30,"gameDuration":1800,"rulesConfig":{},"gameName":"P4"}}]`, gameId))

	sendMessage(t, player, `["Unsubscribe"]`)
	sendMessage(t, opponent, `["Unsubscribe"]`)

	sendMessage(t, player, fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, gameId))
	expectMessage(t, player, `["GameUpdate",{"game":{"gameName":"P4","playerZero":{"id":"player","name":"player"},"playerOne":{"id":"opponent","name":"opponent"},"result":"InProgress","beginning":42}}]`)
	expectMessage(t, player, `["GameEvent",{"event":{"action":"StartGame","eventType":"Action","time":42,"user":{"id":"opponent","name":"opponent"}},"serverTime":42}]`)
	expectMessage(t, player, `["GameEvent",{"event":{"action":"Sync","eventType":"Action","time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)

	sendMessage(t, opponent, fmt.Sprintf(`["SubscribeGame",{"gameId":"%s"}]`, gameId))
	expectMessage(t, opponent, `["GameUpdate",{"game":{"gameName":"P4","playerZero":{"id":"player","name":"player"},"playerOne":{"id":"opponent","name":"opponent"},"result":"InProgress","beginning":42}}]`)
	expectMessage(t, opponent, `["GameEvent",{"event":{"action":"StartGame","eventType":"Action","time":42,"user":{"id":"opponent","name":"opponent"}},"serverTime":42}]`)
	expectMessage(t, opponent, `["GameEvent",{"event":{"action":"Sync","eventType":"Action","time":42,"user":{"id":"opponent","name":"opponent"}},"serverTime":42}]`)

	// Player plays one move
	sendMessage(t, player, `["Move",{"move":{"x":42}}]`)
	expectMessage(t, player, `["GameEvent",{"event":{"eventType":"Move","move":{"x":42},"time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)
	expectMessage(t, opponent, `["GameEvent",{"event":{"eventType":"Move","move":{"x":42},"time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)

	// Opponent proposes draw
	sendMessage(t, opponent, `["Propose",{"proposition":"Draw"}]`)
	expectMessage(t, player, `["GameEvent",{"event":{"eventType":"Request","requestType":"Draw","time":42,"user":{"id":"opponent","name":"opponent"}},"serverTime":42}]`)
	expectMessage(t, opponent, `["GameEvent",{"event":{"eventType":"Request","requestType":"Draw","time":42,"user":{"id":"opponent","name":"opponent"}},"serverTime":42}]`)

	// Player accepts, and game ends
	sendMessage(t, player, `["Accept",{"proposition":"Draw"}]`)
	expectMessage(t, player, `["CurrentGameUpdate",{"currentGame":null}]`)
	expectMessage(t, player, `["GameUpdate",{"game":{"gameName":"P4","playerZero":{"id":"player","name":"player"},"playerOne":{"id":"opponent","name":"opponent"},"result":"AgreedDrawByZero","beginning":42}}]`)
	expectMessage(t, player, `["GameEvent",{"event":{"action":"EndGame","eventType":"Action","time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)
	expectMessage(t, player, `["GameEvent",{"event":{"accept":true,"eventType":"Reply","requestType":"Draw","time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)
	expectMessage(t, opponent, `["CurrentGameUpdate",{"currentGame":null}]`)
	expectMessage(t, opponent, `["GameUpdate",{"game":{"gameName":"P4","playerZero":{"id":"player","name":"player"},"playerOne":{"id":"opponent","name":"opponent"},"result":"AgreedDrawByZero","beginning":42}}]`)
	expectMessage(t, opponent, `["GameEvent",{"event":{"action":"EndGame","eventType":"Action","time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)
	expectMessage(t, opponent, `["GameEvent",{"event":{"accept":true,"eventType":"Reply","requestType":"Draw","time":42,"user":{"id":"player","name":"player"}},"serverTime":42}]`)
 }
