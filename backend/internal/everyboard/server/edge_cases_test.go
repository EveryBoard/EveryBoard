package server

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/auth"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/protocol"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

// Mocks for testing Prepare failures

type FailingFirebase struct {
	auth.Firebase
}

func (f FailingFirebase) Initialize() error {
	return fmt.Errorf("forced firebase failure")
}

type FailingDialector struct {
	gorm.Dialector
}

func (d FailingDialector) Initialize(db *gorm.DB) error {
	return fmt.Errorf("forced dialector failure")
}

func TestPrepareFailures(t *testing.T) {
	t.Run("FirebaseFailure", func(t *testing.T) {
		config := &Configuration{
			Firebase: FailingFirebase{},
		}
		_, err := Prepare(config)
		require.Error(t, err, "error when preparing the server")
	})

	t.Run("DatabaseFailure", func(t *testing.T) {
		config := &Configuration{
			Firebase: FirebaseMock{},
			Database: FailingDialector{},
		}
		auth.SetFirebaseClient(FirebaseMock{})

		_, err := Prepare(config)
		require.Error(t, err, "error when preparing the server")
	})
}

func TestServeHTTPUnauthorized(t *testing.T) {
	// Given a configuration and a request without token
	config := &Configuration{
		Firebase: FirebaseMock{},
	}
	auth.SetFirebaseClient(FirebaseMock{})

	req := httptest.NewRequest("GET", "/ws", nil)
	rr := httptest.NewRecorder()

	// When calling ServeHTTP
	config.ServeHTTP(rr, req)

	// Then it should return 401 Unauthorized
	assert.Equal(t, http.StatusUnauthorized, rr.Code, "expected status 401")
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
