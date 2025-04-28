package internal

import (
	"sync"

	"github.com/gorilla/websocket"
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

type SubscriptionManager struct {
	// A map from WebSocket client to the subscribed game
	clientToGame  map[*websocket.Conn]SubscriptionKindAndGameId
	// A map from subscribed games to the set of clients that subscribed to it.
	// (yes, sets are ugly: map[T]struct{} is a set of T
	gameToClients map[SubscriptionKindAndGameId]utils.Set[*websocket.Conn]
	// A map from client to the user id
	clientToUser  map[*websocket.Conn]string
	// A map from user id to their client
	userToClient  map[string]*websocket.Conn
	// The lock that protects concurrent accesses to the subscription manager
	lock          sync.RWMutex
}

func newSubscriptionManager() *SubscriptionManager {
	return &SubscriptionManager{
		clientToGame:   make(map[*websocket.Conn]SubscriptionKindAndGameId),
		gameToClients:  make(map[SubscriptionKindAndGameId]utils.Set[*websocket.Conn]),
		clientToUser:   make(map[*websocket.Conn]string),
		userToClient:   make(map[string]*websocket.Conn),
	}
}

// Subscribe subscribes a client and its corresponding user to a game
// Assumes that the client is not yet subscribed to a game
func (sm *SubscriptionManager) subscribe(client *websocket.Conn, user string, gameID model.GameID, kind SubscriptionKind) {
	sm.lock.Lock()
	defer sm.lock.Unlock()

	subscriptionKindAndGameId := SubscriptionKindAndGameId{kind, gameID}

	sm.clientToGame[client] = subscriptionKindAndGameId

	_, exists := sm.gameToClients[subscriptionKindAndGameId]
	if !exists {
		// Initialize this set
		sm.gameToClients[subscriptionKindAndGameId] = utils.NewSet[*websocket.Conn]()
	}
	// Add the value to the set
	set := sm.gameToClients[subscriptionKindAndGameId]
	set.Add(client)

	sm.clientToUser[client] = user
	sm.userToClient[user] = client
}

// Unsubscribe removes a client from the subscription lists.
func (sm *SubscriptionManager) Unsubscribe(client *websocket.Conn) {
	sm.lock.Lock()
	defer sm.lock.Unlock()

	subscription, exists := sm.clientToGame[client];
	if exists {
		clients, exists := sm.gameToClients[subscription];
		if exists {
			delete(clients, client)
			if len(clients) == 0 {
				// Need to remove the empty set to avoid hogging memory
				delete(sm.gameToClients, subscription)
			}
		}
	}

	delete(sm.clientToGame, client)
	user, exists := sm.clientToUser[client];
	if exists {
		delete(sm.userToClient, user)
	}
	delete(sm.clientToUser, client)
}

// SubscriptionsTo returns the clients subscribed to the game
func (sm *SubscriptionManager) SubscriptionsTo(kind SubscriptionKind, gameId model.GameID) utils.Set[*websocket.Conn] {
	sm.lock.RLock()
	defer sm.lock.RUnlock()

	subscriptionAndGameId := SubscriptionKindAndGameId{kind, gameId}

	return sm.gameToClients[subscriptionAndGameId]
}

// IsSubscribed checks if a user is already subscribed to a game.
func (sm *SubscriptionManager) IsSubscribed(user string) bool {
	sm.lock.RLock()
	defer sm.lock.RUnlock()
	_, exists := sm.userToClient[user]
	return exists
}

// SubscriptionOf returns the subscription type and game ID of a client, as well as whether there exists one.
func (sm *SubscriptionManager) SubscriptionOf(client *websocket.Conn) (SubscriptionKind, model.GameID, bool) {
	sm.lock.RLock()
	defer sm.lock.RUnlock()

	sub, exists := sm.clientToGame[client]
	return sub.kind, sub.gameID, exists
}

// Broadcast sends a message to all clients subscribed to kind, gameId
func (sm *SubscriptionManager) Broadcast(kind SubscriptionKind, gameId model.GameID, msg OutgoingMessage) error {
	for connection := range(sm.SubscriptionsTo(kind, gameId)) {
		err := SendMessage(connection, msg)
		if err != nil {
			return err
		}
	}
	return nil
}
