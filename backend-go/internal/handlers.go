package internal

import (
	"fmt"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

// TODO: parameterize for tests
func Now() int64 {
	return time.Now().Unix()
}

type Handlers struct {
	connection          *websocket.Conn
	subscriptionManager *SubscriptionManager
	user                *MinimalUser
}

func NewHandlers(connection *websocket.Conn, subscriptionManager *SubscriptionManager, user *MinimalUser) Handlers {
	return Handlers{
		connection,
		subscriptionManager,
		user,
	}
}

func (h *Handlers) Send(message OutgoingMessage) error {
	return SendMessage(h.connection, message)
}

func (h *Handlers) Error(reason Error) error {
	return SendError(h.connection, reason)
}

func (h *Handlers) BroadcastToConfigRoom(gameId GameID, message OutgoingMessage) error {
	return h.subscriptionManager.Broadcast(SubscriptionToConfigRoom, gameId, message)
}

func (h *Handlers) BroadcastToLobby(message OutgoingMessage) error {
	return h.subscriptionManager.Broadcast(SubscriptionToLobby, GameIDLobby, message)
}

func (h *Handlers) SendChatMessages(gameId GameID) error {
	return ApplyToMessagesOfGame(gameId, func(message *Message) error {
		return h.Send(ChatMessage{Message: *message})
	})
}

func (h *Handlers) SendActiveConfigRooms() error {
	return ApplyToConfigRooms(func(configRoom *ConfigRoom) error {
		gameId, err := EncodeId(configRoom.ID)
		if err != nil {
			return err
		}
		return h.Send(ConfigRoomUpdateMessage{
			GameID:     gameId,
			ConfigRoom: *configRoom,
		})
	})
}

func (h *Handlers) SubscribeToLobby() error {
	uid := h.user.ID
	if h.subscriptionManager.IsSubscribed(uid) {
		return h.Error(ErrorAlreadySubscribed)
	}

	h.subscriptionManager.Subscribe(h.connection, uid, GameIDLobby, SubscriptionToLobby)
	err := h.SendChatMessages(GameIDLobby)
	if err != nil {
		return err
	}

	return h.SendActiveConfigRooms()
}

func (h *Handlers) ChatSend(content string) error {
	log.Println("checking subscription")
	kind, gameId, subscribed := h.subscriptionManager.SubscriptionOf(h.connection)
	if subscribed == false {
		return h.Error(ErrorUnknownMessage)
	}

	message := Message{
		Sender:    *h.user,
		Timestamp: Now(),
		Content:   content,
	}
	err := AddChatMessage(gameId, &message)
	if err != nil {
		return err
	}
	return h.subscriptionManager.Broadcast(kind, gameId, ChatMessage{Message: message})
}

func (h *Handlers) CreateGame(gameName string) error {
	if !GameExists(gameName) {
		return h.Error(ErrorGameDoesNotExist)
	}

	configRoom, err := CreateConfigRoom(h.user, gameName)
	if err != nil {
		return err
	}

	gameId, err := EncodeId(configRoom.ID)
	if err != nil {
		return err
	}

	// Send the id to the creator, and the config room to the lobby observers
	err = h.Send(GameCreatedMessage{GameId: gameId})
	if err != nil {
		return err
	}

	return h.BroadcastToLobby(ConfigRoomUpdateMessage{GameID: gameId, ConfigRoom: *configRoom})
}

func (h *Handlers) SubscribeToConfigRoom(gameId string) error {
	uid := h.user.ID
	if h.subscriptionManager.IsSubscribed(uid) {
		return h.Error(ErrorAlreadySubscribed)
	}

	id, err := DecodeId(gameId)
	if err != nil {
		return err
	}

	configRoom, err := GetConfigRoom(id)
	if err != nil {
		return err
	}
	if configRoom == nil {
		return h.Error(ErrorGameDoesNotExist)
	}

	switch configRoom.Status {
	case StatusCreated, StatusConfigProposed:
		// This is a config room in progress
		// Either we have a new candidate, or the creator
		if uid != configRoom.Creator.ID {
			err = AddCandidate(id, h.user)
			if err != nil {
				return err;
			}

			err = h.BroadcastToConfigRoom(id, CandidateJoinedMessage{ Candidate: *h.user })
			if err != nil {
				return err;
			}

			// Send the config room first, then the candidates.
			// The order is important so that the client knows the config room before the candidates
			h.Send(ConfigRoomUpdateMessage{
				GameID: gameId, // TODO: could unmarshal/marshal ids transparently
				ConfigRoom: *configRoom,
			})
			return ApplyToCandidates(id, func(candidate *Candidate) error {
				if candidate.User.ID != uid { // don't send the user to itself twice
					return h.Send(CandidateJoinedMessage{ Candidate: candidate.User })
				}
				return nil;
			})
		}
	case StatusStarted, StatusFinished:
		// This is a started game. The client is probably joining mid-game. Send the config room so that they know about it
				return h.Send(ConfigRoomUpdateMessage{ GameID: gameId, ConfigRoom: *configRoom })
	}
	return fmt.Errorf("SubscribeConfigRoom fell through the end of the switch while it shouldn't")
}

func GetStringMessageArgument(messageData map[string]interface{}, key string) (string, error) {
	v, ok := messageData[key]
	if ok == false {
		return "", fmt.Errorf("Missing data")
	}
	asString, ok := v.(string)
	if ok == false {
		return "", fmt.Errorf("Invalid data")
	}
	return asString, nil
}

func (h *Handlers) Handle(messageType string, messageData map[string]interface{}) error {
	switch messageType {
	case "SubscribeLobby":
		return h.SubscribeToLobby()
	case "Unsubscribe":
		h.subscriptionManager.Unsubscribe(h.connection)
		return nil
	case "ChatSend":
		content, err := GetStringMessageArgument(messageData, "message")
		if err != nil {
			return h.Error(ErrorUnknownMessage)
		} else {
			return h.ChatSend(content)
		}
	case "Create":
		gameName, err := GetStringMessageArgument(messageData, "gameName")
		if err != nil {
			return h.Error(ErrorUnknownMessage)
		} else {
			return h.CreateGame(gameName)
		}
	case "SubscribeConfigRoom":
		gameId, err := GetStringMessageArgument(messageData, "gameId")
		if err != nil {
			return h.Error(ErrorUnknownMessage)
		} else {
			return h.SubscribeToConfigRoom(gameId)
		}
	default:
		return h.Error(ErrorUnknownMessage)
	}
}
