package internal

import (
	"sync"

	"github.com/EveryBoard/EveryBoard/internal/model"
	"github.com/EveryBoard/EveryBoard/internal/utils"
)

type SubscriptionKind int

const (
	SubscriptionToLobby SubscriptionKind = iota
	SubscriptionToConfigRoom
	SubscriptionToGame
)

type SubscriptionKindAndGameId struct {
	kind   SubscriptionKind
	gameID model.GameID
}

// The state of the subscription manager. It is polymorphic in Connection to
// make testing easier, but in practice we deal with *websocket.Conn values.
type SubscriptionManager[Connection comparable] struct {
	// A map from WebSocket client to the subscribed game
	clientToGame  map[Connection]SubscriptionKindAndGameId
	// A map from subscribed games to the set of clients that subscribed to it.
	// (yes, sets are ugly: map[T]struct{} is a set of T
	gameToClients map[SubscriptionKindAndGameId]utils.Set[Connection]
	// A map from client to the user id
	clientToUser  map[Connection]string
	// A map from user id to their (only) client
	userToClient  map[string]Connection
	// The lock that protects concurrent accesses to the subscription manager
	lock          sync.RWMutex
}

func NewSubscriptionManager[Connection comparable]() SubscriptionManager[Connection] {
	return SubscriptionManager[Connection]{
		clientToGame:   make(map[Connection]SubscriptionKindAndGameId),
		gameToClients:  make(map[SubscriptionKindAndGameId]utils.Set[Connection]),
		clientToUser:   make(map[Connection]string),
		userToClient:   make(map[string]Connection),
	}
}

// Subscribe subscribes a client and its corresponding user to a game
// Assumes that the client is not yet subscribed to a game
func (manager *SubscriptionManager[Connection]) Subscribe(client Connection, user string, gameID model.GameID, kind SubscriptionKind) {
	manager.lock.Lock()
	defer manager.lock.Unlock()

	subscriptionKindAndGameId := SubscriptionKindAndGameId{kind, gameID}

	manager.clientToGame[client] = subscriptionKindAndGameId

	_, exists := manager.gameToClients[subscriptionKindAndGameId]
	if !exists {
		// Initialize this set
		manager.gameToClients[subscriptionKindAndGameId] = utils.NewSet[Connection]()
	}
	// Add the value to the set
	set := manager.gameToClients[subscriptionKindAndGameId]
	set.Add(client)

	manager.clientToUser[client] = user
	manager.userToClient[user] = client
}

// Unsubscribe removes a client from the subscription lists.
func (manager *SubscriptionManager[Connection]) Unsubscribe(client Connection) {
	manager.lock.Lock()
	defer manager.lock.Unlock()

	subscription, exists := manager.clientToGame[client];
	if exists {
		clients, exists := manager.gameToClients[subscription];
		if exists {
			delete(clients, client)
			if len(clients) == 0 {
				// Need to remove the empty set to avoid hogging memory
				delete(manager.gameToClients, subscription)
			}
		}
	}

	delete(manager.clientToGame, client)
	user, exists := manager.clientToUser[client];
	if exists {
		delete(manager.userToClient, user)
	}
	delete(manager.clientToUser, client)
}

// Returns the clients subscribed to the game
func (manager *SubscriptionManager[Connection]) SubscriptionsTo(kind SubscriptionKind, gameId model.GameID) utils.Set[Connection] {
	manager.lock.RLock()
	defer manager.lock.RUnlock()

	subscriptionAndGameId := SubscriptionKindAndGameId{kind, gameId}

	return manager.gameToClients[subscriptionAndGameId]
}

// Checks if a user is already subscribed to a game.
func (manager *SubscriptionManager[Connection]) IsSubscribed(user string) bool {
	manager.lock.RLock()
	defer manager.lock.RUnlock()
	_, exists := manager.userToClient[user]
	return exists
}

// Returns the subscription type and game ID of a client, as well as whether there exists one.
func (manager *SubscriptionManager[Connection]) SubscriptionOf(client Connection) (SubscriptionKind, model.GameID, bool) {
	manager.lock.RLock()
	defer manager.lock.RUnlock()

	sub, exists := manager.clientToGame[client]
	return sub.kind, sub.gameID, exists
}

