package internal

import (
	"encoding/json"
	"errors"
	"log"
	"sync"
	"time"

	"github.com/EveryBoard/EveryBoard/internal/model"
	"github.com/EveryBoard/EveryBoard/internal/utils"
	"github.com/gorilla/websocket"
)

// Internal type to deal with message queues properly
type queue struct {
	mu   sync.Mutex
	list []model.OutgoingMessage
}

func (q *queue) push(m model.OutgoingMessage) {
	q.mu.Lock()
	q.list = append(q.list, m)
	q.mu.Unlock()
}

func (q *queue) pop() (model.OutgoingMessage, bool) {
	q.mu.Lock()
	if len(q.list) == 0 {
		q.mu.Unlock()
		return nil, false
	}
	m := q.list[0]
	q.list = q.list[1:]
	q.mu.Unlock()
	return m, true
}

type ConnectionLike interface {
	comparable
	WriteMessage(messageType int, data []byte) error
	SetWriteDeadline(t time.Time) error
}

type infos struct {
	user   model.MinimalUser // the user
	queue  queue             // the queue of messages to send to the user
	signal chan struct{}     // a signal channel to signal that new messages have been queue and should be sent
	done   chan struct{}     // a channel to signal that the client has disconnected
}

type ConnectionManager[Connection ConnectionLike] struct {
	userToClients map[model.MinimalUser]utils.Set[Connection]
	clientToInfos map[Connection]*infos
	lock          sync.RWMutex // lock protecting concurrent updates to the maps above
}

func NewConnectionManager[Connection ConnectionLike]() ConnectionManager[Connection] {
	return ConnectionManager[Connection]{
		userToClients: make(map[model.MinimalUser]utils.Set[Connection]),
		clientToInfos: make(map[Connection]*infos),
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

	infos := &infos{
		user:   user,
		queue:  queue{},
		signal: make(chan struct{}, 1), // Only one signal needed at a time
		done:   make(chan struct{}, 1), // Only one done event will arrive
	}
	connectionManager.clientToInfos[client] = infos

	// This goroutine will process message sends for this client
	go func() {
		for {
			select {
			case <-infos.signal: // wait for the signal before sending all queued messages
				for { // Need to loop as one signal could be for multiple messages
					message, ok := infos.queue.pop()
					if !ok {
						// No more message to send
						break
					}

					toSend, err := json.Marshal([]any{message.Tag(), message})
					if err != nil {
						log.Printf("error when marshalling message: %v", err)
					}
					log.Printf("\033[32m>>> [%s] %v\033[0m", user.Name, string(toSend))
					_ = client.SetWriteDeadline(time.Now().Add(10 * time.Second))
					err = client.WriteMessage(websocket.TextMessage, toSend)
					if err != nil && !(websocket.IsCloseError(err) || errors.Is(err, websocket.ErrCloseSent)) {
						// in case the connection has been closed, we will ignore sent messages
						log.Printf("error when sending message: %v", err)
					}
				}
			case <-infos.done:
				return // connection closed, terminate this goroutine
			}
		}
	}()
}

func (connectionManager *ConnectionManager[Connection]) SendMessage(client Connection, message model.OutgoingMessage) {
	connectionManager.lock.RLock()
	infos, ok := connectionManager.clientToInfos[client]
	connectionManager.lock.RUnlock()

	if !ok {
		// Should never happen if the client has been properly added
		log.Printf("Unexpected: sending a message to a non-existing client!")
		return
	}

	// Queue the message and signal the handler
	infos.queue.push(message)
	select {
	case infos.signal <- struct{}{}:
	default:
		// There's already a signal in the queue of the handler, so we can safely not block here
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

	infos, exists := connectionManager.clientToInfos[client]
	if exists {
		delete(connectionManager.clientToInfos, client)
		close(infos.done) // will stop the goroutine that sends messages
	}
}

func (connectionManager *ConnectionManager[Connection]) AllUserConnections(user model.MinimalUser) utils.Set[Connection] {
	connectionManager.lock.RLock()
	defer connectionManager.lock.RUnlock()

	clients := connectionManager.userToClients[user]
	return clients.Clone()
}

func (connectionManager *ConnectionManager[Connection]) GetUserOfClient(client Connection) *model.MinimalUser {
	connectionManager.lock.RLock()
	defer connectionManager.lock.RUnlock()

	infos, exists := connectionManager.clientToInfos[client]
	if !exists {
		return nil
	}

	return &infos.user
}
