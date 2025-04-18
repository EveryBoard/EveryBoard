package internal

import (
	"sync"

	"github.com/gorilla/websocket"
)

type SubscriptionKind int

const (
	SubscriptionToLobby SubscriptionKind = iota
	SubscriptionToConfigRoom
	SubscriptionToGame
)

type SubscriptionKindAndGameId struct {
	kind   SubscriptionKind
	gameID GameID
}

type SubscriptionManager struct {
	// A map from WebSocket client to the subscribed game
	clientToGame  map[*websocket.Conn]SubscriptionKindAndGameId
	// A map from subscribed games to the set of clients that subscribed to it.
	// (yes, sets are ugly: map[T]struct{} is a set of T
	gameToClients map[SubscriptionKindAndGameId]Set[*websocket.Conn]
	// A map from client to the user id
	clientToUser  map[*websocket.Conn]string
	// A map from user id to their client
	userToClient  map[string]*websocket.Conn
	// The lock that protects concurrent accesses to the subscription manager
	lock          sync.RWMutex
}

func NewSubscriptionManager() *SubscriptionManager {
	return &SubscriptionManager{
		clientToGame:   make(map[*websocket.Conn]SubscriptionKindAndGameId),
		gameToClients:  make(map[SubscriptionKindAndGameId]Set[*websocket.Conn]),
		clientToUser:   make(map[*websocket.Conn]string),
		userToClient:   make(map[string]*websocket.Conn),
	}
}


// Subscribe subscribes a client and its corresponding user to a game
// Assumes that the client is not yet subscribed to a game
func (this *SubscriptionManager) Subscribe(client *websocket.Conn, user string, gameID GameID, kind SubscriptionKind) {
	this.lock.Lock()
	defer this.lock.Unlock()

	subscriptionKindAndGameId := SubscriptionKindAndGameId{kind, gameID}

	this.clientToGame[client] = subscriptionKindAndGameId

	_, exists := this.gameToClients[subscriptionKindAndGameId]
	if exists == false {
		// Initialize this set
		this.gameToClients[subscriptionKindAndGameId] = make(Set[*websocket.Conn])
	}
	// Add the value to the set
	set := this.gameToClients[subscriptionKindAndGameId]
	set.Add(client)

	this.clientToUser[client] = user
	this.userToClient[user] = client
}

// Unsubscribe removes a client from the subscription lists.
func (this *SubscriptionManager) Unsubscribe(client *websocket.Conn) {
	this.lock.Lock()
	defer this.lock.Unlock()

	subscription, exists := this.clientToGame[client];
	if exists {
		clients, exists := this.gameToClients[subscription];
		if exists {
			delete(clients, client)
			if len(clients) == 0 {
				// Need to remove the empty set to avoid hogging memory
				delete(this.gameToClients, subscription)
			}
		}
	}

	delete(this.clientToGame, client)
	user, exists := this.clientToUser[client];
	if exists {
		delete(this.userToClient, user)
	}
	delete(this.clientToUser, client)
}

// SubscriptionsTo returns the clients subscribed to the game
func (this *SubscriptionManager) SubscriptionsTo(kind SubscriptionKind, gameId GameID) Set[*websocket.Conn] {
	this.lock.RLock()
	defer this.lock.RUnlock()

	subscriptionAndGameId := SubscriptionKindAndGameId{kind, gameId}

	return this.gameToClients[subscriptionAndGameId]
}

// IsSubscribed checks if a user is already subscribed to a game.
func (this *SubscriptionManager) IsSubscribed(user string) bool {
	this.lock.RLock()
	defer this.lock.RUnlock()
	_, exists := this.userToClient[user]
	return exists
}

// SubscriptionOf returns the subscription type and game ID of a client, as well as whether there exists one.
func (this *SubscriptionManager) SubscriptionOf(client *websocket.Conn) (SubscriptionKind, GameID, bool) {
	this.lock.Lock()
	defer this.lock.Unlock()

	sub, exists := this.clientToGame[client]
	return sub.kind, sub.gameID, exists
}

// Broadcast sends a message to all clients subscribed to kind, gameId
func (this *SubscriptionManager) Broadcast(kind SubscriptionKind, gameId GameID, msg OutgoingMessage) error {
	for connection := range(this.SubscriptionsTo(kind, gameId)) {
		err := SendMessage(connection, msg)
		if err != nil {
			return err
		}
	}
	return nil
}
