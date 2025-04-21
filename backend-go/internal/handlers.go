package internal

import (
	"fmt"
	"log"
	"time"
	"encoding/json"
	"math/rand"

	"github.com/gorilla/websocket"
)

// TODO: parameterize for tests
func Now() int64 {
	return time.Now().Unix()
}

func NowFloat() float64 {
	return float64(time.Now().UnixNano()) / 1e9
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

func (h *Handlers) SendGameEvents(gameId GameID) error {
	return ApplyToGameEvents(gameId, func(event *GameEvent) error {
		return h.Send(GameEventMessage{Event: *event, ServerTime: NowFloat()})
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
	uid := h.user.ID
	if h.subscriptionManager.IsSubscribed(uid) {
		log.Println("already subscribed 2")
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
		return h.Error(ErrorAlreadySubscribed)
	}

	configRoom, err := GetConfigRoom(gameId)
	if err != nil {
		return err
	}
	if configRoom == nil {
		return h.Error(ErrorGameDoesNotExist)
	}

	h.subscriptionManager.Subscribe(h.connection, h.user.ID, gameId, SubscriptionToConfigRoom)
	switch configRoom.Status {
	case StatusCreated, StatusConfigProposed:
		// This is a config room in progress
		// Either we have a new candidate, or the creator
		if uid != configRoom.Creator.ID {
			// A new candidate appears!
			err = configRoom.AddCandidate(h.user)
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

func (h *Handlers) SubscribeToGame(gameId GameID) error {
	if h.subscriptionManager.IsSubscribed(h.user.ID) {
		return h.Error(ErrorAlreadySubscribed)
	}

	game, err := GetGame(gameId)
	if err != nil {
		return err
	}
	if game == nil {
		return h.Error(ErrorGameDoesNotExist)
	}

	h.subscriptionManager.Subscribe(h.connection, h.user.ID, gameId, SubscriptionToGame)
	// It is important to send the game first and then the events so that the
	// client knows about the game before receiving events
	err = h.Send(GameUpdateMessage{ Game: *game })
	if err != nil {
		return err
	}

	err = h.SendChatMessages(gameId)
	if err != nil {
		return err
	}

	err = h.SendGameEvents(gameId)
	if err != nil {
		return err
	}

	syncEvent := GameEvent{
		Time: Now(),
		User: *h.user,
		Data: EventDataSync,
	}
	return h.Send(GameEventMessage{ Event: syncEvent, ServerTime: NowFloat() })
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
		if configRoom == nil {
			// Config room has been deleted already, nothing else to do
			return nil
		}

		if configRoom.Status.IsUnstarted() {
			if configRoom.Creator.ID == h.user.ID {
				// Creator is leaving its unstarted game, remove it
				err = configRoom.Delete()
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
				err = configRoom.DeleteCandidate(h.user.ID)
				if err != nil {
					return err
				}
				return h.BroadcastToConfigRoom(configRoom.ID, CandidateLeftMessage{ Candidate: *h.user })
			}
		} else {
			// If the game has started, we don't remove it and don't have anything else to do
			return nil
		}
	}
	return fmt.Errorf("Unsubscribe: fell through all switch cases, which shouldn't happen.")
}

func (h *Handlers) SelectOpponent(opponent *MinimalUser) error {
	_, gameId, subscribed := h.subscriptionManager.SubscriptionOf(h.connection)
	if !subscribed {
		return h.Error(ErrorNotSubscribed)
	}

	configRoom, err := GetConfigRoom(gameId)
	if err != nil {
		return err
	}
	if configRoom == nil {
		return h.Error(ErrorUnknownGame)
	}
	if configRoom.Creator.ID != h.user.ID {
		return h.Error(ErrorNotAllowed)
	}

	err = configRoom.SelectOpponent(opponent)
	if err != nil {
		return err
	}

	update := ConfigRoomUpdateMessage{ GameID: gameId, ConfigRoom: *configRoom }
	err = h.BroadcastToConfigRoom(gameId, update)
	if err != nil {
		return err
	}

	return h.BroadcastToLobby(update)
}

func (h *Handlers) ProposeConfig(config *ConfigProposal) error {
	_, gameId, subscribed := h.subscriptionManager.SubscriptionOf(h.connection)
	if !subscribed {
		return h.Error(ErrorNotSubscribed)
	}

	configRoom, err := GetConfigRoom(gameId)
	if err != nil {
		return err
	}
	if configRoom == nil {
		return h.Error(ErrorUnknownGame)
	}
	if configRoom.Creator.ID != h.user.ID || configRoom.ChosenOpponent == nil {
		return h.Error(ErrorNotAllowed)
	}

	err = configRoom.Propose(config)
	if err != nil {
		return err
	}

	return h.BroadcastToConfigRoom(gameId, ConfigRoomUpdateMessage{ GameID: gameId, ConfigRoom: *configRoom })
}

func (h *Handlers) ReviewConfig() error {
	_, gameId, subscribed := h.subscriptionManager.SubscriptionOf(h.connection)
	if !subscribed {
		return h.Error(ErrorNotSubscribed)
	}

	configRoom, err := GetConfigRoom(gameId)
	if err != nil {
		return err
	}
	if configRoom == nil {
		return h.Error(ErrorUnknownGame)
	}
	if configRoom.Creator.ID != h.user.ID {
		return h.Error(ErrorNotAllowed)
	}

	err = configRoom.Review()
	if err != nil {
		return err
	}

	return h.BroadcastToConfigRoom(gameId, ConfigRoomUpdateMessage{ GameID: gameId, ConfigRoom: *configRoom })
}

func (h *Handlers) AcceptConfig() error {
	_, gameId, subscribed := h.subscriptionManager.SubscriptionOf(h.connection)
	if !subscribed {
		return h.Error(ErrorNotSubscribed)
	}

	configRoom, err := GetConfigRoom(gameId)
	if err != nil {
		return err
	}
	if configRoom == nil {
		return h.Error(ErrorUnknownGame)
	}
	if configRoom.ChosenOpponent == nil ||
		configRoom.ChosenOpponent.ID != h.user.ID ||
		configRoom.Status != StatusConfigProposed {
		return h.Error(ErrorNotAllowed)
	}

	// Change the config room status to "started"
	err = configRoom.Start()
	if err != nil {
		return err
	}

	// Create the game
	_, err = configRoom.CreateGame(Now(), rand.Intn(2) == 1)
	if err != nil {
		return err
	}

	// And notify everyone
	update := ConfigRoomUpdateMessage{ GameID: gameId, ConfigRoom: *configRoom }
	err = h.BroadcastToConfigRoom(gameId, update)
	if err != nil {
		return err
	}

	return h.BroadcastToLobby(update)
}

func GetMessageArgument[T interface{}](messageData map[string]json.RawMessage, key string) (*T, error) {
	arg, ok := messageData[key]
	if !ok {
		return nil, fmt.Errorf("Missing data")
	}
	var extracted T
	err := json.Unmarshal(arg, &extracted)
	if err != nil {
		return nil, fmt.Errorf("Invalid data")
	}
	return &extracted, nil
}

func (h *Handlers) Handle(messageType string, messageData map[string]json.RawMessage) error {
	switch messageType {
	case "SubscribeLobby":
		log.Println("subscribe to lobby")
		return h.SubscribeToLobby()
	case "SubscribeConfigRoom":
		gameId, err := GetMessageArgument[GameID](messageData, "gameId")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.SubscribeToConfigRoom(*gameId)
	case "SubscribeGame":
		gameId, err := GetMessageArgument[GameID](messageData, "gameId")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.SubscribeToGame(*gameId)
	case "Unsubscribe":
		return h.Unsubscribe()

	case "ChatSend":
		content, err := GetMessageArgument[string](messageData, "message")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.ChatSend(*content)

	case "Create":
		gameName, err := GetMessageArgument[string](messageData, "gameName")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.CreateGame(*gameName)
	case "SelectOpponent":
		opponent, err := GetMessageArgument[MinimalUser](messageData, "opponent")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.SelectOpponent(opponent)
	case "ProposeConfig":
		config, err := GetMessageArgument[ConfigProposal](messageData, "config")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.ProposeConfig(config)
	case "ReviewConfig":
		return h.ReviewConfig()
	case "AcceptConfig":
		return h.AcceptConfig()

	default:
		return h.Error(ErrorUnknownMessage)
	}
}


func (h *Handlers) ClientLeft() error {
	return h.Unsubscribe()
}
