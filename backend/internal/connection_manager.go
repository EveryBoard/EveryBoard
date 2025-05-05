package internal

import (
	"sync"

	"github.com/EveryBoard/EveryBoard/internal/model"
	"github.com/EveryBoard/EveryBoard/internal/utils"
	"github.com/gorilla/websocket"
)

type ConnectionManager struct {
	clientToUser map[*websocket.Conn]model.MinimalUser
	userToClients map[model.MinimalUser]utils.Set[*websocket.Conn]
	lock          sync.RWMutex
}

func newConnectionManager() *ConnectionManager {
	return &ConnectionManager{
		clientToUser: make(map[*websocket.Conn]model.MinimalUser),
		userToClients: make(map[model.MinimalUser]utils.Set[*websocket.Conn]),
	}
}

func (cm *ConnectionManager) addConnection(user model.MinimalUser, client *websocket.Conn) {
	cm.lock.Lock()
	defer cm.lock.Unlock()

	_, exists := cm.userToClients[user]
	if !exists {
		cm.userToClients[user] = utils.NewSet[*websocket.Conn]()
	}

	set := cm.userToClients[user]
	set.Add(client)

	cm.clientToUser[client] = user
}

func (cm *ConnectionManager) removeConnection(user model.MinimalUser, client *websocket.Conn) {
	cm.lock.Lock()
	defer cm.lock.Unlock()

	clients, exists := cm.userToClients[user]
	if exists {
		delete(clients, client)
		if len(clients) == 0 {
			delete(cm.userToClients, user)
		}
	}

	delete(cm.clientToUser, client)
}

func (cm *ConnectionManager) allUserConnections(user model.MinimalUser) utils.Set[*websocket.Conn] {
	cm.lock.RLock()
	defer cm.lock.RUnlock()

	clients := cm.userToClients[user]
	return clients
}
