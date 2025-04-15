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

func (h *Handlers) SendChatMessages(gameId string) {
	ApplyToMessagesOfGame(gameId, func (message *Message) {
		SendMessage(h.connection, "ChatMessage", ChatMessage{ Message: *message })
	})
}

func (h *Handlers) SubscribeToLobby() {
	uid := h.user.Id
	if h.subscriptionManager.IsSubscribed(uid) {
		SendError(h.connection, AlreadySubscribed)
	} else {
		h.subscriptionManager.Subscribe(h.connection, uid, "lobby", Lobby)
		h.SendChatMessages("lobby")
		// TODO: send active rooms
	}
}

func (h *Handlers) ChatSend(content string) {
	kind, gameId, subscribed := h.subscriptionManager.SubscriptionOf(h.connection)
	if subscribed == false {
		SendError(h.connection, UnknownMessage)
	} else {
		message := Message{
			Sender: *h.user,
			Timestamp: Now(),
			Content: content,
		}
		AddChatMessage(gameId, &message)
		h.subscriptionManager.Broadcast(kind, gameId, "ChatMessage", ChatMessage{ Message: message })
	}
}

func (h *Handlers) CreateGame(connection *websocket.Conn, subscriptionManager *SubscriptionManager, gameName string) {
	if !GameExists(gameName) {
		SendError(connection, GameDoesNotExist)
	} else {
		gameId, configRoom := CreateConfigRoom()
		// Send the id to the creator, and the config room to the lobby observers
		SendMessage(h.connection, "GameCreated", GameCreatedMessage{ GameId: gameId })
		h.subscriptionManager.Broadcast(Lobby, LobbyId, ConfigRoomUpdate{ GameId: gameId, ConfigRoom: configRoom })
	}
}
