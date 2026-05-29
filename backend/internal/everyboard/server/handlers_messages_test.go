package server

import (
	"github.com/stretchr/testify/require"
	"net/http"
	"testing"

	"github.com/gorilla/websocket"
)

func TestInvalidMessages(t *testing.T) {
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()

	client := EstablishWebSocketConnection(t, "player")
	defer client.Close()

	// Invalid message because tag does not exist
	sendRawMessage(t, client, `["Invalid"]`)
	expectMessage(t, client, `["Error",{"reason":"unknown-message"}]`)

	// Invalid message because it's not even JSON
	sendRawMessage(t, client, `Invalid`)
	expectMessage(t, client, `["Error",{"reason":"unknown-message"}]`)

	// SubscribeConfigRoom needs a gameId
	sendRawMessage(t, client, `["SubscribeConfigRoom", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// SubscribeGame needs a gameId
	sendRawMessage(t, client, `["SubscribeGame", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// ChatSend needs a message
	sendRawMessage(t, client, `["ChatSend", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// Create needs a gameName
	sendRawMessage(t, client, `["Create", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// SelectOpponent needs an opponent
	sendRawMessage(t, client, `["SelectOpponent", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// ProposeConfig needs a config
	sendRawMessage(t, client, `["ProposeConfig", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// NotifyTimeout needs a timeoutedPlayer
	sendRawMessage(t, client, `["NotifyTimeout", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// EndGame needs a winner
	sendRawMessage(t, client, `["EndGame", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// Propose needs a proposition
	sendRawMessage(t, client, `["Propose", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// Reject needs a propposition
	sendRawMessage(t, client, `["Reject", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// Accept needs a propposition
	sendRawMessage(t, client, `["Accept", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// AddTime needs a kind
	sendRawMessage(t, client, `["AddTime", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)

	// Move needs a move
	sendRawMessage(t, client, `["Move", {}]`)
	expectMessage(t, client, `["Error",{"reason":"invalid-data"}]`)
}

func TestMessageArgumentErrors(t *testing.T) {
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

	c := dial("user1")
	defer c.Close()

	tests := []struct {
		name string
		msg  string
	}{
		{"SubscribeConfigRoomMissing", `["SubscribeConfigRoom",{}]`},
		{"SubscribeGameMissing", `["SubscribeGame",{}]`},
		{"ChatSendMissing", `["ChatSend",{}]`},
		{"CreateMissing", `["Create",{}]`},
		{"SelectOpponentMissing", `["SelectOpponent",{}]`},
		{"ProposeConfigMissing", `["ProposeConfig",{}]`},
		{"NotifyTimeoutMissing", `["NotifyTimeout",{}]`},
		{"EndGameMissing", `["EndGame",{}]`},
		{"ProposeMissing", `["Propose",{}]`},
		{"RejectMissing", `["Reject",{}]`},
		{"AcceptMissing", `["Accept",{}]`},
		{"AddTimeMissing", `["AddTime",{}]`},
		{"MoveMissing", `["Move",{}]`},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := c.WriteMessage(websocket.TextMessage, []byte(tt.msg))
			require.NoError(t, err, "WriteMessage failed")
			msg := readWithTimeout(t, c)
			require.NotNil(t, msg, "expected message")
		})
	}
}

func TestHandleErrorsSimple(t *testing.T) {
	sb := NewScenarioBuilder(t)
	defer sb.Cleanup()

	user1 := sb.EstablishConnection("user1")
	conn1 := sb.getConnection(user1)

	// 1. Unknown message
	sendRawMessage(t, conn1, `["Unknown"]`)
	expectMessage(t, conn1, `["Error",{"reason":"unknown-message"}]`)

	// 2. Invalid data
	sendRawMessage(t, conn1, `["SubscribeConfigRoom",{"gameId":123}]`)
	expectMessage(t, conn1, `["Error",{"reason":"invalid-data"}]`)

	// 3. Already subscribed to lobby
	sendRawMessage(t, conn1, `["SubscribeLobby"]`)
	// Try again
	sendRawMessage(t, conn1, `["SubscribeLobby"]`)
	expectMessage(t, conn1, `["Error",{"reason":"already-subscribed"}]`)

	// 4. Create while subscribed
	sendRawMessage(t, conn1, `["Create",{"gameName":"p4"}]`)
	expectMessage(t, conn1, `["Error",{"reason":"already-subscribed"}]`)
}
