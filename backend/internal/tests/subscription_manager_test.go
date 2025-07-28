package internal

import (
	"testing"

	everyboard "github.com/EveryBoard/EveryBoard/internal"
	"github.com/EveryBoard/EveryBoard/internal/model"
)

type MockConnection = int

func TestSubscriptionWorkflow(t *testing.T) {
	// Given a subscription manager with no subscription for client
	manager := everyboard.NewSubscriptionManager[MockConnection]()
	connection := 42
	user := "some-user"
	subscriptionKind := everyboard.SubscriptionToLobby
	const gameID model.GameID = model.GameIDLobby

	if len(manager.SubscriptionsTo(subscriptionKind, gameID)) != 0 {
		t.Fatalf("New subscription manager should not have any subscription to start with")
	}
	if manager.IsSubscribed(user) {
		t.Fatalf("Non-subscribed user should not have any subscription")
	}
	_, _, subscribed := manager.SubscriptionOf(connection)
	if subscribed {
		t.Fatalf("Non-subscribed connection should not be subscribed")
	}
	// When we subscribe a client
	manager.Subscribe(connection, user, gameID, subscriptionKind)
	// Then it should be subscribed to the game
	if !manager.SubscriptionsTo(subscriptionKind, gameID).Exists(connection) {
		t.Fatalf("Subscribed user should be subscribed")
	}
	if !manager.IsSubscribed(user) {
		t.Fatalf("Subscribed user should be subscribed")
	}
	actualSubscriptionKind, actualGameID, subscribed := manager.SubscriptionOf(connection)
	if !subscribed || actualSubscriptionKind != subscriptionKind || actualGameID != gameID {
		t.Fatalf("Subscription does not match what has been subscribed to")
	}

	// And when we unsubscribe it
	manager.Unsubscribe(connection)

	// Then the client should not be connected anymore
	if len(manager.SubscriptionsTo(subscriptionKind, gameID)) != 0 {
		t.Fatalf("There should be no subscriptions after unsubscribing ")
	}
	if manager.IsSubscribed(user) {
		t.Fatalf("User should not be subscribed after unsubscribing")
	}
	_, _, subscribed = manager.SubscriptionOf(connection)
	if subscribed {
		t.Fatalf("User should not be subscribed after unsubscribing")
	}
}
