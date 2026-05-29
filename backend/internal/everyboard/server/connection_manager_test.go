package server

import (
	"net/http"
	"testing"
	"time"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/protocol"
	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/require"
)

func TestConnectionMessageQueueHandlesBurst(t *testing.T) {
	stopServer, _, config := PrepareServer(t)
	defer stopServer()

	c := EstablishWebSocketConnection(t, "victim")
	defer c.Close()

	for i := 0; i < 1000; i++ {
		config.Connections.SendMessage(c, protocol.ErrorMessage{Reason: apperror.ErrorUnknownMessage.Msg})
	}
}

func TestSendMessageToClosedConnection(t *testing.T) {
	stopServer, _, config := PrepareServer(t)
	defer stopServer()

	// Create a connection and immediately close it in CM
	headers := http.Header{}
	headers.Set("Sec-WebSocket-Protocol", tokenForUser("user1"))
	c, _, err := websocket.DefaultDialer.Dial(testWebSocketURL("/ws"), headers)
	require.NoError(t, err, "Dial failed")
	// Give it time to register
	time.Sleep(100 * time.Millisecond)

	// Close it from CM side
	user, _ := config.Connections.GetUserOfClient(c)
	config.Connections.RemoveConnection(user, c)

	// Try to send a message
	config.Connections.SendMessage(c, protocol.ErrorMessage{Reason: "test"})

	// Should not panic, and should be skipped in push loop
	time.Sleep(100 * time.Millisecond)
}
