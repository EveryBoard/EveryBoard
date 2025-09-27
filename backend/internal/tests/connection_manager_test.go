package internal

import (
	"testing"

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
	actualUser := manager.GetUserOfClient(otherConnection)
	if actualUser == nil || actualUser.ID != user.ID {
		t.Fatalf("connection manager did not properly map connection to user: %v", actualUser)
	}
	// And we should get nothing if we look for an unexisting connection
	noUser := manager.GetUserOfClient(&MockConnection{ID: 44})
	if noUser != nil {
		t.Fatalf("connection manager should not have any user mapped to an unexisting connection, but it does: %v", noUser)
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
