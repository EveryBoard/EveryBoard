package ws

import (
	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/handler"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/logger"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/protocol"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/session"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/store"
	"github.com/gorilla/websocket"
)

type clientSession struct {
	connection    *websocket.Conn
	user          model.MinimalUser
	store         store.Store
	connections   *session.ConnectionManager[*websocket.Conn]
	subscriptions *session.SubscriptionManager[*websocket.Conn]
	handlers      handler.Handler
}

func newClientSession(
	connection *websocket.Conn,
	user model.MinimalUser,
	store store.Store,
	connections *session.ConnectionManager[*websocket.Conn],
	subscriptions *session.SubscriptionManager[*websocket.Conn],
) clientSession {
	return clientSession{
		connection:    connection,
		user:          user,
		store:         store,
		connections:   connections,
		subscriptions: subscriptions,
		handlers:      handler.New(connection, user, store, connections, subscriptions),
	}
}

func (c clientSession) start() error {
	c.connection.SetReadLimit(32768)

	c.connections.AddConnection(c.user, c.connection)
	defer c.connections.RemoveConnection(c.user, c.connection)
	logger.Debug.Printf("[%v] Connect", c.user.Name)

	if err := c.sendInitialState(); err != nil {
		return err
	}

	c.readMessages()
	return nil
}

func (c clientSession) sendInitialState() error {
	currentGame, err := c.store.GetCurrentGame(c.user)
	if err != nil {
		return err
	}
	c.connections.SendMessage(c.connection, protocol.CurrentGameUpdateMessage{
		CurrentGame: currentGame,
	})
	return nil
}

func (c clientSession) readMessages() {
	for {
		_, msg, err := c.connection.ReadMessage()
		if err != nil {
			c.disconnect()
			return
		}
		c.handleMessage(msg)
	}
}

func (c clientSession) handleMessage(msg []byte) {
	logger.Debug.Printf("<<< [%v] %v", c.user.Name, string(msg))
	messageType, messageData, err := protocol.DecodeIncomingMessage(msg)
	if err != nil {
		c.handlers.SendError(apperror.ErrorUnknownMessage)
		return
	}
	c.handlers.Handle(messageType, messageData)
}

func (c clientSession) disconnect() {
	logger.Info.Printf("[%v] Disconnect", c.user.Name)
	if err := c.handlers.ClientLeft(); err != nil {
		logger.Error.Printf("Error when disconnecting client: %v", err)
	}
}
