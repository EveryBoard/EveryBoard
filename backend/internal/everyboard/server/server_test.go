package server

import (
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
	if err != nil {
		t.Fatalf("request creation failed: %v", err)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("OPTIONS request failed: %v", err)
	}
	defer resp.Body.Close()

	// Then it should succeed and have the Allow-Origin header set
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		t.Errorf("Unexpected status: %d", resp.StatusCode)
	}

	if origin := resp.Header.Get("Access-Control-Allow-Origin"); origin != "*" {
		t.Errorf("Expected Access-Control-Allow-Origin '*', got %q", origin)
	}
}

func TestWebSocketRequest(t *testing.T) {
	// Given a server
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()

	// When doing a websocket request
	headers := http.Header{}
	headers.Set("Sec-WebSocket-Protocol", "Authorization, yJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJmb28ifQo.")
	c, resp, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
	if err != nil {
		t.Fatalf("Dial failed: %v (status %v)", err, resp.Status)
	}
	defer c.Close()

	// Then it should upgrade to websocket
	if resp.StatusCode != http.StatusSwitchingProtocols {
		t.Errorf("Expected 101 Switching Protocols, got %d", resp.StatusCode)
	}

	// And send a first message about current game
	_, _, err = c.ReadMessage()
	if err != nil {
		t.Fatalf("cannot send message: %v", err)
	}

	// When we send a broken message
	err = c.WriteMessage(websocket.TextMessage, []byte(`alq"`))
	if err != nil {
		t.Fatalf("cannot send message: %v", err)
	}
	// Then we get an error reply
	_, msg, err := c.ReadMessage()
	if err != nil {
		t.Fatalf("error when receiving response: %v", err)
	}
	if string(msg) != `["Error",{"reason":"unknown-message"}]` {
		t.Fatalf("error response is not the expected one: %s", string(msg))
	}

	// When we send a not-understood message
	err = c.WriteMessage(websocket.TextMessage, []byte(`["Unknown"]`))
	if err != nil {
		t.Fatalf("cannot send message: %v", err)
	}
	// Then we get an error reply
	_, msg, err = c.ReadMessage()
	if err != nil {
		t.Fatalf("error when receiving response: %v", err)
	}
	if string(msg) != `["Error",{"reason":"unknown-message"}]` {
		t.Fatalf("error response is not the expected one: %s", string(msg))
	}

	// When we send an understood message
	err = c.WriteMessage(websocket.TextMessage, []byte(`["SubscribeToLobby"]`))
	if err != nil {
		t.Fatalf("cannot send message: %v", err)
	}
	// Then it works
	_, msg, err = c.ReadMessage()
	if err != nil {
		t.Fatalf("error when receiving response: %v", err)
	}
	if string(msg) != `["Error",{"reason":"unknown-message"}]` {
		t.Fatalf("error response is not the expected one: %s", string(msg))
	}
}
