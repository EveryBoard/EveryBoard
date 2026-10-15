package ws

import (
	"net/http"
	"testing"
	"time"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/protocol"
	"github.com/stretchr/testify/require"
)

func TestConnectionMessageQueueHandlesBurst(t *testing.T) {
	stopServer, _, config := PrepareServer(t)
	defer stopServer()

	c := EstablishWebSocketConnection(t, "victim")
	defer func() { _ = c.Close() }()

	for i := 0; i < 1000; i++ {
		config.Connections.SendMessage(c, protocol.ErrorMessage{Reason: apperror.ErrorUnknownMessage.Msg})
	}
}

func TestSendMessageToClosedConnection(t *testing.T) {
	stopServer, _, config := PrepareServer(t)
	defer stopServer()

	// Given a closed connection
	headers := http.Header{}
	headers.Set("Sec-WebSocket-Protocol", tokenForUser("user1"))
	c, _, err := dialWebSocket(testWebSocketURL("/ws"), headers)
	require.NoError(t, err, "Dial failed")
	defer func() { _ = c.Close() }()
	time.Sleep(100 * time.Millisecond) // Give it time to register

	user, _ := config.Connections.GetUserOfClient(c)
	config.Connections.RemoveConnection(user, c)

	// When sending it a message
	config.Connections.SendMessage(c, protocol.ErrorMessage{Reason: "test"})

	// Then it should not not panic, and should be skipped in push loop
	time.Sleep(100 * time.Millisecond)
}
