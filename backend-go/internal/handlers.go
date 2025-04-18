package internal

import (
	"time"

	"github.com/gorilla/websocket"
)

// TODO: parameterize for tests
func Now() int64 {
	return time.Now().Unix()
}

type Handlers struct {
	connection *websocket.Conn
	subscriptionManager *SubscriptionManager
	user *MinimalUser
}

func NewHandlers(connection *websocket.Conn, subscriptionManager *SubscriptionManager, user *MinimalUser) Handlers {
	return Handlers{
		connection,
		subscriptionManager,
		user,
	}
}

func (h *Handlers) SendChatMessages(gameId string) error {
	return ApplyToMessagesOfGame(gameId, func (message *Message) {
		SendMessage(h.connection, ChatMessage{ Message: *message })
	})
}

func (h *Handlers) SubscribeToLobby() error {
	uid := h.user.ID
	if h.subscriptionManager.IsSubscribed(uid) {
		return SendError(h.connection, ErrorAlreadySubscribed)
	} else {
		h.subscriptionManager.Subscribe(h.connection, uid, GameIDLobby, SubscriptionToLobby)
		return h.SendChatMessages("lobby")
		// TODO: send active rooms
	}
}

func (h *Handlers) ChatSend(content string) error {
	kind, gameId, subscribed := h.subscriptionManager.SubscriptionOf(h.connection)
	if subscribed == false {
		return SendError(h.connection, ErrorUnknownMessage)
	} else {
		message := Message{
			Sender: *h.user,
			Timestamp: Now(),
			Content: content,
		}
		err := AddChatMessage(gameId, &message)
		if err != nil {
			return err
		}
		return h.subscriptionManager.Broadcast(kind, gameId, ChatMessage{ Message: message })
	}
}

func (h *Handlers) CreateGame(gameName string) error {
	if !GameExists(gameName) {
		return SendError(h.connection, ErrorGameDoesNotExist)
	} else {
		configRoom, err := CreateConfigRoom(h.user, gameName)
		if err != nil {
			return err
		}
		gameId, err := EncodeId(configRoom.ID)
		if err != nil {
			return err
		}

		// Send the id to the creator, and the config room to the lobby observers
		err = SendMessage(h.connection, GameCreatedMessage{ GameId: gameId })
		if err != nil {
			return err
		}

		return h.subscriptionManager.Broadcast(SubscriptionToLobby, GameIDLobby,
			ConfigRoomUpdateMessage{ GameId: gameId, ConfigRoom: *configRoom })
	}
}
