package internal

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/EveryBoard/EveryBoard/internal/model"
	"github.com/EveryBoard/EveryBoard/internal/utils"
	"github.com/gorilla/websocket"
)

type ConnectionLike interface {
	comparable
	WriteMessage(messageType int, data []byte) error
}

type ConnectionManager[Connection ConnectionLike] struct {
	clientToUser    map[Connection]model.MinimalUser
	userToClients   map[model.MinimalUser]utils.Set[Connection]
	clientToChannel map[Connection]chan model.OutgoingMessage
	lock            sync.RWMutex
}

func NewConnectionManager[Connection ConnectionLike]() ConnectionManager[Connection] {
	return ConnectionManager[Connection]{
		clientToUser:    make(map[Connection]model.MinimalUser),
		userToClients:   make(map[model.MinimalUser]utils.Set[Connection]),
		clientToChannel: make(map[Connection]chan model.OutgoingMessage),
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
	channel := make(chan model.OutgoingMessage, 4) // Will buffer at most 4 messages
	connectionManager.clientToChannel[client] = channel

	go func() {
		for message := range channel {
			toSend, err := json.Marshal([]any{message.Tag(), message})
			if err != nil {
				log.Printf("cannot send message: %v", err)
			}
			log.Printf("\033[32m>>> [%s] %v\033[0m", user.Name, string(toSend))
			err = client.WriteMessage(websocket.TextMessage, toSend)
			if err != nil && !(websocket.IsCloseError(err) || err == websocket.ErrCloseSent) {
				// in case the connection has been closed, we will continue with the rest but ignore sent messages
				log.Printf("error when sending message: %v", err)
			}
		}
	}()
}

func (connectionManager *ConnectionManager[Connection]) SendMessage(client Connection, message model.OutgoingMessage) {
	connectionManager.lock.RLock()
	channel, ok := connectionManager.clientToChannel[client]
	connectionManager.lock.RUnlock()

	if !ok {
		// Should never happen if the client has been properly added
		return
	}

	// This will try to enqueue the message if there is room for it
	select {
	case channel <- message: // enqueue the message
	default:
		// the buffer is full, ignore this message (the client is likely dead)
	}


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
	channel, exists := connectionManager.clientToChannel[client]
	if exists {
		close(channel) // will stop the goroutine that sends messages
		delete(connectionManager.clientToChannel, client)
	}
}

func (connectionManager *ConnectionManager[Connection]) AllUserConnections(user model.MinimalUser) utils.Set[Connection] {
	connectionManager.lock.RLock()
	defer connectionManager.lock.RUnlock()

	clients := connectionManager.userToClients[user]
	return clients
}

func (connectionManager *ConnectionManager[Connection]) GetUserOfClient(client Connection) *model.MinimalUser {
	connectionManager.lock.RLock()
	defer connectionManager.lock.RUnlock()

	user, exists := connectionManager.clientToUser[client]
	if !exists {
		return nil
	}

	return &user
}
