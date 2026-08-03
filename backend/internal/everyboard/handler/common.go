package handler

import (
	"encoding/json"
	"fmt"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
	"github.com/gorilla/websocket"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/notification"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/protocol"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/session"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/store"
)

func sendMessage(connections *session.ConnectionManager[*websocket.Conn], connection *websocket.Conn, message protocol.OutgoingMessage) {
	connections.SendMessage(connection, message)
}

type Handler struct {
	connection    *websocket.Conn
	user          model.MinimalUser
	store         store.Store
	connections   *session.ConnectionManager[*websocket.Conn]
	subscriptions *session.SubscriptionManager[*websocket.Conn]
	notifier      notification.Notifier
}

func New(
	connection *websocket.Conn,
	user model.MinimalUser,
	store store.Store,
	connections *session.ConnectionManager[*websocket.Conn],
	subscriptions *session.SubscriptionManager[*websocket.Conn],
	notifiers ...notification.Notifier,
) Handler {
	notifier := notification.Notifier(notification.Noop{})
	if len(notifiers) > 0 && notifiers[0] != nil {
		notifier = notifiers[0]
	}
	return Handler{
		connection:    connection,
		user:          user,
		store:         store,
		connections:   connections,
		subscriptions: subscriptions,
		notifier:      notifier,
	}
}

type Message struct {
	connection *websocket.Conn
	message    protocol.OutgoingMessage
}

// The message buffer is used to keep messages during a db transaction,
// so that we can send them all after the transaction succeeded
type MsgBuffer struct {
	msgs []Message
}

func (b *MsgBuffer) addSend(connection *websocket.Conn, message protocol.OutgoingMessage) {
	b.msgs = append(b.msgs, Message{connection: connection, message: message})
}

func (h *Handler) bufferBroadcastToUser(b *MsgBuffer, user model.MinimalUser, message protocol.OutgoingMessage) {
	for conn := range h.connections.AllUserConnections(user) {
		b.addSend(conn, message)
	}
}

func (h *Handler) bufferBroadcast(b *MsgBuffer, kind session.SubscriptionKind, gameId model.GameID, message protocol.OutgoingMessage) {
	for conn := range h.subscriptions.SubscriptionsTo(kind, gameId) {
		b.addSend(conn, message)
	}
}

func (h *Handler) bufferBroadcastToConfigRoom(b *MsgBuffer, gameId model.GameID, message protocol.OutgoingMessage) {
	h.bufferBroadcast(b, session.SubscriptionToConfigRoom, gameId, message)
}

func (h *Handler) bufferBroadcastToLobby(b *MsgBuffer, message protocol.OutgoingMessage) {
	h.bufferBroadcast(b, session.SubscriptionToLobby, model.GameIDLobby, message)
}

func (h *Handler) bufferBroadcastToGame(b *MsgBuffer, gameId model.GameID, message protocol.OutgoingMessage) {
	h.bufferBroadcast(b, session.SubscriptionToGame, gameId, message)
}

func (h *Handler) setCurrentGame(b *MsgBuffer, store store.CurrentGameStore, user model.MinimalUser, cg *model.CurrentGame) error {
	cg.UserID = user.ID
	cg.UserName = user.Name
	if err := store.SetCurrentGame(cg); err != nil {
		return err
	}
	h.bufferBroadcastToUser(b, user, protocol.CurrentGameUpdateMessage{CurrentGame: cg})
	return nil
}

func (h *Handler) updateCurrentGame(b *MsgBuffer, store store.CurrentGameStore, user model.MinimalUser, cg *model.CurrentGame) error {
	cg.UserID = user.ID
	cg.UserName = user.Name
	if err := store.UpdateCurrentGame(user, cg); err != nil {
		return err
	}
	h.bufferBroadcastToUser(b, user, protocol.CurrentGameUpdateMessage{CurrentGame: cg})
	return nil
}

func (h *Handler) removeCurrentGame(b *MsgBuffer, store store.CurrentGameStore, user model.MinimalUser) error {
	if err := store.RemoveCurrentGame(user); err != nil {
		return err
	}
	h.bufferBroadcastToUser(b, user, protocol.CurrentGameUpdateMessage{CurrentGame: nil})
	return nil
}

func (h *Handler) flush(b *MsgBuffer) {
	for _, msg := range b.msgs {
		sendMessage(h.connections, msg.connection, msg.message)
	}
}

func (h *Handler) send(message protocol.OutgoingMessage) {
	sendMessage(h.connections, h.connection, message)
}

func (h *Handler) SendError(err apperror.BackendError) {
	h.send(protocol.ErrorMessage{Reason: err.Msg})
}

func (h *Handler) BroadcastToUser(user model.MinimalUser, message protocol.OutgoingMessage) {
	for connection := range h.connections.AllUserConnections(user) {
		sendMessage(h.connections, connection, message)
	}
}

func (h *Handler) unsubscribe() error {
	subscriptionKind, gameId, subscribed := h.subscriptions.SubscriptionOf(h.connection)
	if !subscribed {
		return nil
	}
	// Unsubscribe before the transaction so broadcasts inside do not include this connection
	h.subscriptions.Unsubscribe(h.connection)

	var buf MsgBuffer
	err := h.store.Transaction(func(store store.Store) error {
		switch subscriptionKind {
		case session.SubscriptionToLobby:
			return nil

		case session.SubscriptionToGame:
			game, err := store.GetGame(gameId)
			if err != nil {
				return err
			}
			if game == nil {
				return apperror.ErrorUnknownGame
			}
			// Only remove the current game for observers; players must remain in game
			// even if they close their tab, so they can't join a new game in another tab
			if game.PlayerZero.ID != h.user.ID && game.PlayerOne.ID != h.user.ID {
				if err = h.removeCurrentGame(&buf, store, h.user); err != nil {
					return err
				}
			}
			return nil

		case session.SubscriptionToConfigRoom:
			configRoom, err := store.GetConfigRoom(gameId)
			if err != nil {
				return err
			}
			if configRoom == nil {
				return nil
			}
			if !configRoom.Status.IsUnstarted() {
				return nil
			}

			if configRoom.Creator.ID == h.user.ID {
				if err = store.DeleteConfigRoom(configRoom); err != nil {
					return err
				}

				update := protocol.ConfigRoomDeletedMessage{GameID: configRoom.ID}
				h.bufferBroadcastToConfigRoom(&buf, configRoom.ID, update)
				h.bufferBroadcastToLobby(&buf, update)

				if err = store.ApplyToCandidates(configRoom.ID, func(candidate model.Candidate) error {
					return h.removeCurrentGame(&buf, store, candidate.User)
				}); err != nil {
					return err
				}

				return h.removeCurrentGame(&buf, store, configRoom.Creator)

			} else {
				if err = store.DeleteCandidate(configRoom, h.user.ID); err != nil {
					return err
				}
				h.bufferBroadcastToConfigRoom(&buf, configRoom.ID, protocol.CandidateLeftMessage{Candidate: h.user})

				if configRoom.ChosenOpponent != nil && configRoom.ChosenOpponent.ID == h.user.ID {
					if err = store.RemoveOpponent(configRoom); err != nil {
						return err
					}
					h.bufferBroadcastToConfigRoom(&buf, configRoom.ID, protocol.ConfigRoomUpdateMessage{
						GameID:     configRoom.ID,
						ConfigRoom: *configRoom,
					})
					newCreatorGame := &model.CurrentGame{
						GameID:   configRoom.ID,
						GameName: configRoom.GameName,
						Creator:  configRoom.Creator,
						Opponent: nil,
						Role:     model.UserRoleCreator,
					}
					if err = h.updateCurrentGame(&buf, store, configRoom.Creator, newCreatorGame); err != nil {
						return err
					}
				}

				return h.removeCurrentGame(&buf, store, h.user)
			}
		}

		return fmt.Errorf("unsubscribe: fell through all switch cases, which shouldn't happen")
	})
	if err != nil {
		return err
	}

	h.flush(&buf)
	return nil
}

func getMessageArgument[T any](messageData map[string]json.RawMessage, key string) (*T, error) {
	arg, ok := messageData[key]
	if !ok {
		return nil, fmt.Errorf("missing data")
	}
	var extracted T
	err := json.Unmarshal(arg, &extracted)
	if err != nil {
		return nil, fmt.Errorf("invalid data")
	}
	return &extracted, nil
}
