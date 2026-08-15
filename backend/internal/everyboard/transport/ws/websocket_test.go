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
	// TODO: need GWT
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
	rr := httptest.NewRecorder() // TODO: why do we need this?

	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusUnauthorized, rr.Code, "expected status 401")
}

func TestWebSocketRequest(t *testing.T) {
	// TODO: ned GWT
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()

	headers := http.Header{}
	// TODO: token should be in clear + function call
	headers.Set("Sec-WebSocket-Protocol", "Authorization, yJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJmb28ifQo.")
	c, resp, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
	require.NoError(t, err, "Dial failed")
	defer c.Close()

	assert.Equal(t, http.StatusSwitchingProtocols, resp.StatusCode, "expected websocket upgrade")

	_, _, err = c.ReadMessage()
	require.NoError(t, err, "failed to read message")

	err = c.WriteMessage(websocket.TextMessage, []byte(`alq"`))
	require.NoError(t, err, "WriteMessage failed")
	_, msg, err := c.ReadMessage()
	require.NoError(t, err, "failed to read message")
	require.Equal(t, `["Error",{"reason":"unknown-message"}]`, string(msg), "expected unknown-message error")

	// TODO: why does this one look like the same as the previous? Add GWT to be clear
	err = c.WriteMessage(websocket.TextMessage, []byte(`["Unknown"]`))
	require.NoError(t, err, "WriteMessage failed")
	_, msg, err = c.ReadMessage()
	require.NoError(t, err, "failed to read message")
	require.Equal(t, `["Error",{"reason":"unknown-message"}]`, string(msg), "expected unknown-message error")

	err = c.WriteMessage(websocket.TextMessage, []byte(`["SubscribeToLobby"]`))
	require.NoError(t, err, "WriteMessage failed")
	_, msg, err = c.ReadMessage()
	require.NoError(t, err, "failed to read message")
	require.Equal(t, `["Error",{"reason":"unknown-message"}]`, string(msg), "expected unknown-message error")
}

func TestInitialStateOnlySentToNewConnection(t *testing.T) {
	// TODO: GWT
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

	second := dial()
	defer second.Close()
	expectMessage(t, second, `["CurrentGameUpdate",{"currentGame":null}]`)

	require.NoError(t, first.SetReadDeadline(time.Now().Add(200*time.Millisecond)), "SetReadDeadline failed")
	_, msg, err := first.ReadMessage()
	require.Error(t, err, "first connection should not receive another initial state")
	require.Nil(t, msg, "unexpected message on first connection")
}

// TODO: test that a bot can authenticate?
