package server

import (
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"net/http"
	"testing"

	"github.com/gorilla/websocket"
)

func TestCors(t *testing.T) {
	// Given a server
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()

	// When doing a Options request
	req, err := http.NewRequest(http.MethodOptions, testHTTPURL("/ws"), nil)
	require.NoError(t, err, "cannot create request")
	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err, "cannot make http request")
	defer resp.Body.Close()

	// Then it should succeed and have the Allow-Origin header set
	assert.Contains(t, []int{http.StatusOK, http.StatusNoContent}, resp.StatusCode, "unexpected CORS status")

	assert.Equal(t, "*", resp.Header.Get("Access-Control-Allow-Origin"), "invalid Access-Control-Allow-Origin")
}

func TestWebSocketRequest(t *testing.T) {
	// Given a server
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()

	// When doing a websocket request
	headers := http.Header{}
	headers.Set("Sec-WebSocket-Protocol", "Authorization, yJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJmb28ifQo.")
	c, resp, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
	require.NoError(t, err, "Dial failed")
	defer c.Close()

	// Then it should upgrade to websocket
	assert.Equal(t, http.StatusSwitchingProtocols, resp.StatusCode, "expected websocket upgrade")

	// And send a first message about current game
	_, _, err = c.ReadMessage()
	require.NoError(t, err, "failed to read message")

	// When we send a broken message
	err = c.WriteMessage(websocket.TextMessage, []byte(`alq"`))
	require.NoError(t, err, "WriteMessage failed")
	// Then we get an error reply
	_, msg, err := c.ReadMessage()
	require.NoError(t, err, "failed to read message")
	require.Equal(t, `["Error",{"reason":"unknown-message"}]`, string(msg), "expected unknown-message error")

	// When we send a not-understood message
	err = c.WriteMessage(websocket.TextMessage, []byte(`["Unknown"]`))
	require.NoError(t, err, "WriteMessage failed")
	// Then we get an error reply
	_, msg, err = c.ReadMessage()
	require.NoError(t, err, "failed to read message")
	require.Equal(t, `["Error",{"reason":"unknown-message"}]`, string(msg), "expected unknown-message error")

	// When we send an understood message
	err = c.WriteMessage(websocket.TextMessage, []byte(`["SubscribeToLobby"]`))
	require.NoError(t, err, "WriteMessage failed")
	// Then it works
	_, msg, err = c.ReadMessage()
	require.NoError(t, err, "failed to read message")
	require.Equal(t, `["Error",{"reason":"unknown-message"}]`, string(msg), "expected unknown-message error")
}
