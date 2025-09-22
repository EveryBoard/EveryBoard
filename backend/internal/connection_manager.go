package internal

import (
	"sync"

	"github.com/EveryBoard/EveryBoard/internal/model"
	"github.com/EveryBoard/EveryBoard/internal/utils"
)

type ConnectionManager[Connection comparable] struct {
	clientToUser  map[Connection]model.MinimalUser
	userToClients map[model.MinimalUser]utils.Set[Connection]
	lock          sync.RWMutex
}

func NewConnectionManager[Connection comparable]() ConnectionManager[Connection] {
	return ConnectionManager[Connection]{
		clientToUser:  make(map[Connection]model.MinimalUser),
		userToClients: make(map[model.MinimalUser]utils.Set[Connection]),
	}
}

func (connectionManager *ConnectionManager[Connection]) AddConnection(user model.MinimalUser, client Connection) {
	connectionManager.lock.Lock()
	defer connectionManager.lock.Unlock()

	_, exists := connectionManager.userToClients[user]
	if !exists {
		connectionManager.userToClients[user] = utils.NewSet[Connection]()
	}

	set := connectionManager.userToClients[user]
	set.Add(client)

	connectionManager.clientToUser[client] = user
}

func (connectionManager *ConnectionManager[Connection]) RemoveConnection(user model.MinimalUser, client Connection) {
	connectionManager.lock.Lock()
	defer connectionManager.lock.Unlock()

	clients, exists := connectionManager.userToClients[user]
	if exists {
		delete(clients, client)
		if len(clients) == 0 {
			delete(connectionManager.userToClients, user)
		}
	}

	delete(connectionManager.clientToUser, client)
}

func (connectionManager *ConnectionManager[Connection]) AllUserConnections(user model.MinimalUser) utils.Set[Connection] {
	connectionManager.lock.RLock()
	defer connectionManager.lock.RUnlock()

	clients := connectionManager.userToClients[user]
	return clients
}

func (connectionManager ConnectionManager[Connection]) GetUserOfClient(client Connection) *model.MinimalUser {
	connectionManager.lock.Lock()
	defer connectionManager.lock.Unlock()

	user, exists := connectionManager.clientToUser[client]
	if !exists {
		return nil
	} else {
		return &user
	}
}
