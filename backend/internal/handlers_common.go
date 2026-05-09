package internal

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"time"

	"github.com/gorilla/websocket"

	model "github.com/EveryBoard/EveryBoard/internal/model"
)

func nowImpl() int64 {
	return time.Now().Unix()
}

var Now = nowImpl

func nowFloatImpl() float64 {
	return float64(time.Now().UnixNano()) / 1e9
}

var NowFloat = nowFloatImpl

func randBoolImpl() bool {
	return rand.Intn(2) == 1
}

var RandBool = randBoolImpl

func sendMessage(connections *ConnectionManager[*websocket.Conn], connection *websocket.Conn, message model.OutgoingMessage) {
	connections.SendMessage(connection, message)
}

type Handlers struct {
	connection    *websocket.Conn
	user          model.MinimalUser
	store         model.Store
	connections   *ConnectionManager[*websocket.Conn]
	subscriptions *SubscriptionManager[*websocket.Conn]
}

type Message struct {
	connection *websocket.Conn
	message    model.OutgoingMessage
}

// The message buffer is used to keep messages during a db transaction,
// so that we can send them all after the transaction succeeded
type MsgBuffer struct {
	msgs []Message
}

func (b *MsgBuffer) addSend(connection *websocket.Conn, message model.OutgoingMessage) {
	b.msgs = append(b.msgs, Message{connection: connection, message: message})
}

func (h *Handlers) bufferBroadcastToUser(b *MsgBuffer, user model.MinimalUser, message model.OutgoingMessage) {
	for conn := range h.connections.AllUserConnections(user) {
		b.addSend(conn, message)
	}
}

func (h *Handlers) bufferBroadcast(b *MsgBuffer, kind SubscriptionKind, gameId model.GameID, message model.OutgoingMessage) {
	for conn := range h.subscriptions.SubscriptionsTo(kind, gameId) {
		b.addSend(conn, message)
	}
}

func (h *Handlers) bufferBroadcastToConfigRoom(b *MsgBuffer, gameId model.GameID, message model.OutgoingMessage) {
	h.bufferBroadcast(b, SubscriptionToConfigRoom, gameId, message)
}

func (h *Handlers) bufferBroadcastToLobby(b *MsgBuffer, message model.OutgoingMessage) {
	h.bufferBroadcast(b, SubscriptionToLobby, model.GameIDLobby, message)
}

func (h *Handlers) bufferBroadcastToGame(b *MsgBuffer, gameId model.GameID, message model.OutgoingMessage) {
	h.bufferBroadcast(b, SubscriptionToGame, gameId, message)
}

func (h *Handlers) setCurrentGame(b *MsgBuffer, store model.CurrentGameStore, user model.MinimalUser, cg *model.CurrentGame) error {
	cg.UserID = user.ID
	cg.UserName = user.Name
	if err := store.SetCurrentGame(cg); err != nil {
		return err
	}
	h.bufferBroadcastToUser(b, user, model.CurrentGameUpdateMessage{CurrentGame: cg})
	return nil
}

func (h *Handlers) updateCurrentGame(b *MsgBuffer, store model.CurrentGameStore, user model.MinimalUser, cg *model.CurrentGame) error {
	cg.UserID = user.ID
	cg.UserName = user.Name
	if err := store.UpdateCurrentGame(user, cg); err != nil {
		return err
	}
	h.bufferBroadcastToUser(b, user, model.CurrentGameUpdateMessage{CurrentGame: cg})
	return nil
}

func (h *Handlers) removeCurrentGame(b *MsgBuffer, store model.CurrentGameStore, user model.MinimalUser) error {
	if err := store.RemoveCurrentGame(user); err != nil {
		return err
	}
	h.bufferBroadcastToUser(b, user, model.CurrentGameUpdateMessage{CurrentGame: nil})
	return nil
}

func (h *Handlers) flush(b *MsgBuffer) {
	for _, msg := range b.msgs {
		sendMessage(h.connections, msg.connection, msg.message)
	}
}

func (h *Handlers) send(message model.OutgoingMessage) {
	sendMessage(h.connections, h.connection, message)
}

func (h *Handlers) sendError(err model.BackendError) {
	h.send(model.ErrorMessage{Reason: err.Msg})
}

func (h *Handlers) broadcastToUser(user model.MinimalUser, message model.OutgoingMessage) {
	for connection := range h.connections.AllUserConnections(user) {
		sendMessage(h.connections, connection, message)
	}
}

func (h *Handlers) unsubscribe() error {
	subscriptionKind, gameId, subscribed := h.subscriptions.SubscriptionOf(h.connection)
	if !subscribed {
		return nil
	}
	// Unsubscribe before the transaction so broadcasts inside do not include this connection
	h.subscriptions.Unsubscribe(h.connection)

	var buf MsgBuffer
	err := h.store.Transaction(func(store model.Store) error {
		switch subscriptionKind {
		case SubscriptionToLobby:
			return nil

		case SubscriptionToGame:
			game, err := store.GetGame(gameId)
			if err != nil {
				return err
			}
			if game == nil {
				return model.ErrorUnknownGame
			}
			// Only remove the current game for observers; players must remain in game
			// even if they close their tab, so they can't join a new game in another tab
			if game.PlayerZero.ID != h.user.ID && game.PlayerOne.ID != h.user.ID {
				if err = h.removeCurrentGame(&buf, store, h.user); err != nil {
					return err
				}
			}
			return nil

		case SubscriptionToConfigRoom:
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

				update := model.ConfigRoomDeletedMessage{GameID: configRoom.ID}
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
				h.bufferBroadcastToConfigRoom(&buf, configRoom.ID, model.CandidateLeftMessage{Candidate: h.user})

				if configRoom.ChosenOpponent != nil && configRoom.ChosenOpponent.ID == h.user.ID {
					if err = store.RemoveOpponent(configRoom); err != nil {
						return err
					}
					h.bufferBroadcastToConfigRoom(&buf, configRoom.ID, model.ConfigRoomUpdateMessage{
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
