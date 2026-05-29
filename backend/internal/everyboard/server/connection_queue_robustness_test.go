package server

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/protocol"
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
