package internal

import (
	"fmt"
	"log"
	"time"
	"encoding/json"

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
		return h.Send(ConfigRoomUpdateMessage{
			GameID:     configRoom.ID,
			ConfigRoom: *configRoom,
		})
	})
}

func (h *Handlers) SubscribeToLobby() error {
	log.Println("1")
	uid := h.user.ID
	if h.subscriptionManager.IsSubscribed(uid) {
		log.Println("already subscribed 2")
		return h.Error(ErrorAlreadySubscribed)
	}

	log.Println("2")
	h.subscriptionManager.Subscribe(h.connection, uid, GameIDLobby, SubscriptionToLobby)
	err := h.SendChatMessages(GameIDLobby)
	if err != nil {
		return err
	}
	log.Println("3")

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
	log.Println("Looking for «%v»", gameName)
	if !GameExists(gameName) {
		return h.Error(ErrorUnknownGame)
	}

	configRoom, err := CreateConfigRoom(h.user, gameName)
	if err != nil {
		return err
	}

	// Send the id to the creator, and the config room to the lobby observers
	err = h.Send(GameCreatedMessage{GameId: configRoom.ID})
	if err != nil {
		return err
	}

	return h.BroadcastToLobby(ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom})
}

func (h *Handlers) SubscribeToConfigRoom(gameId GameID) error {
	uid := h.user.ID
	if h.subscriptionManager.IsSubscribed(uid) {
		log.Println("already subscribed 1")
		return h.Error(ErrorAlreadySubscribed)
	}

	configRoom, err := GetConfigRoom(gameId)
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
			// A new candidate appears!
			err = AddCandidate(gameId, h.user)
			if err != nil {
				return err;
			}

			err = h.BroadcastToConfigRoom(gameId, CandidateJoinedMessage{ Candidate: *h.user })
			if err != nil {
				return err;
			}
		}
		// For both candidates and creator, send the config room first, then the candidates.
		// The order is important so that the client knows the config room before the candidates
		h.Send(ConfigRoomUpdateMessage{
			GameID: gameId,
			ConfigRoom: *configRoom,
		})
		return ApplyToCandidates(gameId, func(candidate *Candidate) error {
			if candidate.User.ID != uid { // don't send the user to itself twice
				return h.Send(CandidateJoinedMessage{ Candidate: candidate.User })
			}
			return nil;
		})
	case StatusStarted, StatusFinished:
		// This is a started game. The client is probably joining mid-game. Send the config room so that they know about it
		return h.Send(ConfigRoomUpdateMessage{ GameID: gameId, ConfigRoom: *configRoom })
	}
	return fmt.Errorf("SubscribeConfigRoom fell through the end of the switch while it shouldn't. Game status was %v", configRoom.Status)
}

func (h *Handlers) Unsubscribe() error {
	subscriptionKind, gameId, subscribed := h.subscriptionManager.SubscriptionOf(h.connection)
	if !subscribed {
		// They're not subscribed, there's nothing to do
		return nil
	}
	h.subscriptionManager.Unsubscribe(h.connection)

	switch subscriptionKind {
	case SubscriptionToLobby, SubscriptionToGame:
		// Leaving the lobby or a game is easy: there's nothing to do
		return nil
	case SubscriptionToConfigRoom:
		// Leaving a config room means we may need to remove the candidate or cancel the game entirely
		configRoom, err := GetConfigRoom(gameId)
		if err != nil {
			return err
		}

		if configRoom.Status.IsUnstarted() {
			if configRoom.Creator.ID == h.user.ID {
				// Creator is leaving its unstarted game, remove it
				err = DeleteConfigRoom(configRoom.ID)
				if err != nil {
					return err
				}

				update := ConfigRoomDeletedMessage{ GameID: configRoom.ID }
				err = h.BroadcastToConfigRoom(configRoom.ID, update)
				if err != nil {
					return err
				}
				return h.BroadcastToLobby(update)
			} else {
				// Candidate has left
				err = DeleteCandidate(configRoom.ID, h.user.ID)
				if err != nil {
					return err
				}
				return h.BroadcastToConfigRoom(configRoom.ID, CandidateLeftMessage{ Candidate: *h.user })

			}

		}
		// If the game has started, we don't remove it
	}
	return fmt.Errorf("Unsubscribe: fell through all switch cases, which shouldn't happen.")

}

func GetStringMessageArgument(messageData map[string]json.RawMessage, key string) (string, error) {
	v, ok := messageData[key]
	if !ok {
		return "", fmt.Errorf("Missing data")
	}
	var str string
	err := json.Unmarshal(v, &str)
	if err != nil {
		return "", fmt.Errorf("Invalid data")
	}
	return str, nil
}

func GetGameIdArgument(messageData map[string]json.RawMessage) (*GameID, error) {
	v, ok := messageData["gameId"]
	if !ok {
		return nil, fmt.Errorf("Missing data")
	}
	var gameId GameID
	err := json.Unmarshal(v, &gameId)
	if err != nil {
		return nil, err
	}

	return &gameId, nil
}

func (h *Handlers) Handle(messageType string, messageData map[string]json.RawMessage) error {
	switch messageType {
	case "SubscribeLobby":
		log.Println("subscribe to lobby")
		return h.SubscribeToLobby()
	case "Unsubscribe":
		return h.Unsubscribe()
	case "ChatSend":
		content, err := GetStringMessageArgument(messageData, "message")
		if err != nil {
			return h.Error(ErrorInvalidData)
		} else {
			return h.ChatSend(content)
		}
	case "Create":
		gameName, err := GetStringMessageArgument(messageData, "gameName")
		if err != nil {
			return h.Error(ErrorInvalidData)
		} else {
			return h.CreateGame(gameName)
		}
	case "SubscribeConfigRoom":
		gameId, err := GetGameIdArgument(messageData)
		if err != nil {
			log.Println(err)
			return h.Error(ErrorInvalidData)
		} else {
			return h.SubscribeToConfigRoom(*gameId)
		}
	default:
		return h.Error(ErrorUnknownMessage)
	}
}


func (h *Handlers) ClientLeft() error {
	return h.Unsubscribe()
}
