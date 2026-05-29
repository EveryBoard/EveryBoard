package session

import (
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/stretchr/testify/require"
	"testing"
	"time"
)

type MockConnection struct {
	ID int
}

func (m *MockConnection) WriteMessage(messageType int, data []byte) error {
	return nil
}

func (m *MockConnection) SetWriteDeadline(t time.Time) error {
	return nil
}

func (m *MockConnection) Close() error {
	return nil
}

func TestSubscriptionWorkflow(t *testing.T) {
	// Given a subscription manager with no subscription for client
	manager := NewSubscriptionManager[MockConnection]()
	connection := MockConnection{ID: 42}
	user := "some-user"
	subscriptionKind := SubscriptionToLobby
	const gameID model.GameID = model.GameIDLobby

	require.Equal(t, 0, len(manager.SubscriptionsTo(subscriptionKind, gameID)), "user should not have subscriptions before subscribing")
	require.False(t, manager.IsSubscribed(user), "user should not be subscribed before subscribing")
	_, _, subscribed := manager.SubscriptionOf(connection)
	require.False(t, subscribed, "connection should not have a subscription before subscribing")
	// When we subscribe a client
	manager.Subscribe(connection, user, gameID, subscriptionKind)
	// Then it should be subscribed to the game
	require.True(t, manager.SubscriptionsTo(subscriptionKind, gameID).Has(connection), "connection should be subscribed")
	require.True(t, manager.IsSubscribed(user), "user should be subscribed")
	actualSubscriptionKind, actualGameID, subscribed := manager.SubscriptionOf(connection)
	require.True(t, subscribed, "connection should have a subscription")
	require.Equal(t, subscriptionKind, actualSubscriptionKind, "invalid subscription kind")
	require.Equal(t, gameID, actualGameID, "invalid subscribed game id")

	// And when we unsubscribe it
	manager.Unsubscribe(connection)

	// Then the client should not be connected anymore
	require.Equal(t, 0, len(manager.SubscriptionsTo(subscriptionKind, gameID)), "user should not have subscriptions after unsubscribing")
	require.False(t, manager.IsSubscribed(user), "user should not be subscribed after unsubscribing")
	_, _, subscribed = manager.SubscriptionOf(connection)
	require.False(t, subscribed, "connection should not have a subscription after unsubscribing")
}
