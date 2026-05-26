package internal

import (
	"sync/atomic"
	"testing"
	"time"

	everyboard "github.com/EveryBoard/EveryBoard/internal"
	"github.com/EveryBoard/EveryBoard/internal/model"
)

func TestConnectionWorkflow(t *testing.T) {
	// Given a connection manager with no connection for a user
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	manager := everyboard.NewConnectionManager[*MockConnection]()
	if len(manager.AllUserConnections(user)) != 0 {
		t.Fatalf("connection manager should start empty")
	}

	// When we add a connection
	connection := &MockConnection{ID: 42}
	manager.AddConnection(user, connection)

	// Then it should be there
	connections := manager.AllUserConnections(user)
	if len(connections) != 1 {
		t.Fatalf("connection manager should contain one connection, but contains %d", len(connections))
	}

	if !connections.Exists(connection) {
		t.Fatalf("connection manager does not contain the expected connection, %v", connections)
	}

	// When we add another one for the same user
	otherConnection := &MockConnection{ID: 43}
	manager.AddConnection(user, otherConnection)
	// Then it should be there along with the other one
	connections = manager.AllUserConnections(user)
	if len(connections) != 2 {
		t.Fatalf("connection manager should contain two connections, but contains %d", len(connections))
	}

	if !connections.Exists(connection) || !connections.Exists(otherConnection) {
		t.Fatalf("connection manager does not contain the expected connections, %v", connections)
	}

	// We should be able to map the connection to the user
	actualUser, ok := manager.GetUserOfClient(otherConnection)
	if !ok || actualUser.ID != user.ID {
		t.Fatalf("connection manager did not properly map connection to user: %v", actualUser)
	}
	// And we should get nothing if we look for an unexisting connection
	_, ok = manager.GetUserOfClient(&MockConnection{ID: 44})
	if ok {
		t.Fatalf("connection manager should not have any user mapped to an unexisting connection, but it does")
	}

	// When we remove a connection
	manager.RemoveConnection(user, connection)
	// Then it shouldn't be there
	connections = manager.AllUserConnections(user)
	if len(connections) != 1 {
		t.Fatalf("connection manager should contain one connection, but contains %d", len(connections))
	}

	if !connections.Exists(otherConnection) {
		t.Fatalf("connection manager does not contain the expected connection, %v", connections)
	}

	// When we remove the only remaining connection
	manager.RemoveConnection(user, otherConnection)
	// Then we should not have any more connection
	connections = manager.AllUserConnections(user)
	if len(connections) != 0 {
		t.Fatalf("connection manager should not contain any connection, but contains %d", len(connections))
	}
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
	manager := everyboard.NewConnectionManager[*CountMessagesConnection]()
	connection := &CountMessagesConnection{
		receiveNext: make(chan struct{}, 1),
	}
	manager.AddConnection(user, connection)
	// When sending many messages (to simulate a player reconnecting and receiving all events)
	numberOfMessages := 100
	for _ = range numberOfMessages {
		manager.SendMessage(connection, model.ChatMessage{})
	}

	// Then it should not lose messages
	if connection.messagesReceived.Load() != 0 {
		t.Fatalf("unexpected: we received messages even we shouldn't have (yet)")
	}
	for _ = range numberOfMessages {
		connection.receiveNext <- struct{}{} // will make it receive one more message
	}
	time.Sleep(100 * time.Millisecond) // wait a bit to make sure every message has been processed
	if got := int(connection.messagesReceived.Load()); got != numberOfMessages {
		t.Fatalf("unexpected: received %d messages instead of %d", got, numberOfMessages)
	}
}
