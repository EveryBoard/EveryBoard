package ws

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/session"
	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestServeHTTPUnauthorized(t *testing.T) {
	// Given a WebSocket handler and a request without authentication
	fakeStore := NewFakeStore()
	subscriptions := session.NewSubscriptionManager[*websocket.Conn]()
	connections := session.NewConnectionManager[*websocket.Conn]()
	handler := New(Dependencies{
		Firebase:      FirebaseMock{},
		Store:         fakeStore,
		Subscriptions: &subscriptions,
		Connections:   &connections,
		Origin:        "*",
	})

	req := httptest.NewRequest("GET", "/ws", nil)
	rr := httptest.NewRecorder()

	// When serving the request
	handler.ServeHTTP(rr, req)

	// Then the request should be rejected as unauthorized
	assert.Equal(t, http.StatusUnauthorized, rr.Code, "expected status 401")
}

func TestWebSocketRequest(t *testing.T) {
	// Given a running WebSocket server and valid authentication
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()

	headers := http.Header{}
	headers.Set("Sec-WebSocket-Protocol", tokenForUser("foo"))

	// When establishing a WebSocket connection
	c, resp, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
	require.NoError(t, err, "Dial failed")
	defer c.Close()

	// Then the HTTP connection should be upgraded to WebSocket
	assert.Equal(t, http.StatusSwitchingProtocols, resp.StatusCode, "expected websocket upgrade")

	// And the connection should receive its initial state
	_, _, err = c.ReadMessage()
	require.NoError(t, err, "failed to read message")
}

func TestMalformedWebSocketMessage(t *testing.T) {
	// Given an established WebSocket connection
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()
	client := EstablishWebSocketConnection(t, "foo")
	defer client.Close()

	// When sending a malformed message
	sendRawMessage(t, client, `alq"`)

	// Then an unknown-message error should be returned
	expectMessage(t, client, `["Error",{"reason":"unknown-message"}]`)
}

func TestUnknownWebSocketMessage(t *testing.T) {
	// Given an established WebSocket connection
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()
	client := EstablishWebSocketConnection(t, "foo")
	defer client.Close()

	// When sending a message with an unknown tag
	sendRawMessage(t, client, `["Unknown"]`)

	// Then an unknown-message error should be returned
	expectMessage(t, client, `["Error",{"reason":"unknown-message"}]`)
}

func TestSubscribeToLobbyWebSocketMessage(t *testing.T) {
	// Given an established WebSocket connection
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()
	client := EstablishWebSocketConnection(t, "foo")
	defer client.Close()

	// When sending a SubscribeToLobby message
	sendRawMessage(t, client, `["SubscribeToLobby"]`)

	// Then an unknown-message error should be returned
	expectMessage(t, client, `["Error",{"reason":"unknown-message"}]`)
}

func TestInitialStateOnlySentToNewConnection(t *testing.T) {
	// Given a user with an established WebSocket connection that received its initial state
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()

	dial := func() *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser("same-user"))
		c, resp, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
		require.NoError(t, err, "Dial failed")
		require.Equal(t, http.StatusSwitchingProtocols, resp.StatusCode, "expected websocket upgrade")
		return c
	}

	first := dial()
	defer first.Close()
	expectMessage(t, first, `["CurrentGameUpdate",{"currentGame":null}]`)

	// When the same user establishes a second connection
	second := dial()
	defer second.Close()

	// Then only the new connection should receive the initial state
	expectMessage(t, second, `["CurrentGameUpdate",{"currentGame":null}]`)

	require.NoError(t, first.SetReadDeadline(time.Now().Add(200*time.Millisecond)), "SetReadDeadline failed")
	_, msg, err := first.ReadMessage()
	require.Error(t, err, "first connection should not receive another initial state")
	require.Nil(t, msg, "unexpected message on first connection")
}
