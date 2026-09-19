package session

import (
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/protocol"
	"github.com/stretchr/testify/require"
	"sync/atomic"
	"testing"
	"time"
)

func TestConnectionWorkflow(t *testing.T) {
	// Given a connection manager with no connection for a user
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	manager := NewConnectionManager[*MockConnection]()
	require.Equal(t, 0, len(manager.AllUserConnections(user)), "user should not have connections before adding one")

	// When we add a connection
	connection := &MockConnection{ID: 42}
	manager.AddConnection(user, connection)

	// Then it should be there
	connections := manager.AllUserConnections(user)
	require.Equal(t, 1, len(connections), "user should have one connection")

	require.True(t, connections.Has(connection), "user connections should contain the added connection")

	// When we add another one for the same user
	otherConnection := &MockConnection{ID: 43}
	manager.AddConnection(user, otherConnection)
	// Then it should be there along with the other one
	connections = manager.AllUserConnections(user)
	require.Equal(t, 2, len(connections), "user should have two connections")

	require.True(t, connections.Has(connection), "user connections should contain the first connection")
	require.True(t, connections.Has(otherConnection), "user connections should contain the second connection")

	// We should be able to map the connection to the user
	actualUser, ok := manager.GetUserOfClient(otherConnection)
	require.True(t, ok, "connection should map back to a user")
	require.Equal(t, user.ID, actualUser.ID, "connection mapped to the wrong user")
	// And we should get nothing if we look for an unexisting connection
	_, ok = manager.GetUserOfClient(&MockConnection{ID: 44})
	require.False(t, ok, "unknown connection should not map to a user")

	// When we remove a connection
	manager.RemoveConnection(user, connection)
	// Then it shouldn't be there
	connections = manager.AllUserConnections(user)
	require.Equal(t, 1, len(connections), "user should have one connection after removing one")

	require.True(t, connections.Has(otherConnection), "remaining connection should still be registered")

	// When we remove the only remaining connection
	manager.RemoveConnection(user, otherConnection)
	// Then we should not have any more connection
	connections = manager.AllUserConnections(user)
	require.Equal(t, 0, len(connections), "user should have no connections after removing all")
}

type CountMessagesConnection struct {
	messagesReceived atomic.Int32
	receiveNext      chan struct{} // to signal that we should receive the next message
}

func (c *CountMessagesConnection) WriteMessage(messageType int, data []byte) error {
	<-c.receiveNext // wait for being signalled to receive the next message (to simulate network delays)
	c.messagesReceived.Add(1)
	return nil
}

func (c *CountMessagesConnection) SetWriteDeadline(t time.Time) error {
	return nil
}

func (c *CountMessagesConnection) Close() error {
	return nil
}
func TestManyMessages(t *testing.T) {
	// Given a connection manager with one connection
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	manager := NewConnectionManager[*CountMessagesConnection]()
	connection := &CountMessagesConnection{
		receiveNext: make(chan struct{}, 1),
	}
	manager.AddConnection(user, connection)
	// When sending many messages (to simulate a player reconnecting and receiving all events)
	numberOfMessages := 100
	for _ = range numberOfMessages {
		manager.SendMessage(connection, protocol.ChatMessage{})
	}

	// Then it should not lose messages
	require.Equal(t, int32(0), connection.messagesReceived.Load(), "connection should not receive messages before processing starts")
	for _ = range numberOfMessages {
		connection.receiveNext <- struct{}{} // will make it receive one more message
	}
	time.Sleep(100 * time.Millisecond) // wait a bit to make sure every message has been processed
	require.Equal(t, numberOfMessages, int(connection.messagesReceived.Load()), "connection should receive all queued messages")
}
