package session

import (
	"encoding/json"
	"errors"
	"sync"
	"time"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/logger"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/protocol"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/utils"
	"github.com/gorilla/websocket"
)

// Internal type to deal with message queues properly
type queue struct {
	mu   sync.Mutex
	list []protocol.OutgoingMessage
}

func (q *queue) push(m protocol.OutgoingMessage) bool {
	q.mu.Lock()
	defer q.mu.Unlock()
	if len(q.list) >= 256 {
		return false
	}
	q.list = append(q.list, m)
	return true
}

func (q *queue) pop() (protocol.OutgoingMessage, bool) {
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

// The type of connection we want to deal with.
// In practice, this is a WebSocket connection, but we abstract over it for better testing.
type ConnectionLike interface {
	comparable
	// Send a message over the connection
	WriteMessage(messageType int, data []byte) error
	// Close the connection
	Close() error
	// Set a timeout for sending a message, for better robustness
	SetWriteDeadline(t time.Time) error
}

// The informations of a connection
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
						logger.Error.Printf("error when marshalling message: %v", err)
					}
					logger.Debug.Printf(">>> [%s] %v", user.Name, string(toSend))
					_ = client.SetWriteDeadline(time.Now().Add(10 * time.Second))
					err = client.WriteMessage(websocket.TextMessage, toSend)
					if err != nil && !(websocket.IsCloseError(err) || errors.Is(err, websocket.ErrCloseSent)) {
						// in case the connection has been closed, we will ignore sent messages
						logger.Error.Printf("error when sending message: %v", err)
					}
				}
			case <-infos.done:
				return // connection closed, terminate this goroutine
			}
		}
	}()
}

func (connectionManager *ConnectionManager[Connection]) SendMessage(client Connection, message protocol.OutgoingMessage) {
	connectionManager.lock.RLock()
	infos, ok := connectionManager.clientToInfos[client]
	connectionManager.lock.RUnlock()

	if !ok {
		// Should never happen if the client has been properly added
		logger.Error.Printf("Unexpected: sending a message to a non-existing client!")
		return
	}

	// Queue the message and signal the handler
	if !infos.queue.push(message) {
		logger.Error.Printf("Queue full for user %s, disconnecting", infos.user.Name)
		_ = client.Close()
		return
	}
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

func (connectionManager *ConnectionManager[Connection]) GetUserOfClient(client Connection) (model.MinimalUser, bool) {
	connectionManager.lock.RLock()
	defer connectionManager.lock.RUnlock()

	infos, exists := connectionManager.clientToInfos[client]
	if !exists {
		return model.MinimalUser{}, false
	}

	return infos.user, true
}
