package internal

import (
	"fmt"
	"log"
	"time"
	"encoding/json"
	"math/rand"

	"github.com/gorilla/websocket"

	model "github.com/EveryBoard/EveryBoard/internal/model"
)

// TODO: parameterize for tests
func Now() int64 {
	return time.Now().Unix()
}

func NowFloat() float64 {
	return float64(time.Now().UnixNano()) / 1e9
}

func RandBool() bool {
	return rand.Intn(2) == 1
}

type Handlers struct {
	connection          *websocket.Conn
	subscriptionManager *SubscriptionManager
	user                *model.MinimalUser
}

func NewHandlers(connection *websocket.Conn, subscriptionManager *SubscriptionManager, user *model.MinimalUser) Handlers {
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

func (h *Handlers) BroadcastToConfigRoom(gameId model.GameID, message OutgoingMessage) error {
	return h.subscriptionManager.Broadcast(SubscriptionToConfigRoom, gameId, message)
}

func (h *Handlers) BroadcastToLobby(message OutgoingMessage) error {
	return h.subscriptionManager.Broadcast(SubscriptionToLobby, model.GameIDLobby, message)
}

func (h *Handlers) BroadcastToGame(gameId model.GameID, message OutgoingMessage) error {
	return h.subscriptionManager.Broadcast(SubscriptionToGame, gameId, message)
}

func (h *Handlers) SendChatMessages(gameId model.GameID) error {
	return model.ApplyToMessagesOfGame(gameId, func(message *model.Message) error {
		return h.Send(ChatMessage{Message: *message})
	})
}

func (h *Handlers) SendGameEvents(gameId model.GameID) error {
	return model.ApplyToGameEvents(gameId, func(event *model.GameEvent) error {
		return h.Send(GameEventMessage{Event: *event, ServerTime: NowFloat()})
	})
}

func (h *Handlers) SendActiveConfigRooms() error {
	return model.ApplyToConfigRooms(func(configRoom *model.ConfigRoom) error {
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

	h.subscriptionManager.Subscribe(h.connection, uid, model.GameIDLobby, SubscriptionToLobby)
	err := h.SendChatMessages(model.GameIDLobby)
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

	message := model.Message{
		Sender:    *h.user,
		Timestamp: Now(),
		Content:   content,
	}
	err := model.AddChatMessage(gameId, &message)
	if err != nil {
		return err
	}
	return h.subscriptionManager.Broadcast(kind, gameId, ChatMessage{Message: message})
}

func (h *Handlers) CreateGame(gameName string) error {
	if !GameExists(gameName) {
		// TODO FOR REVIEW: je suis d'avis que ce check pourrait partir. Il nous
		// cause plus de mal que de bien: quand le backend est déployé dans une
		// autre branche et qu'on défini un jeu dans une branche en parallèle,
		// on se fait niquer à plus pouvoir tester ce jeu. Autant rester souple
		// là dessus je dirais.
		return h.Error(ErrorUnknownGame)
	}

	configRoom, err := model.CreateConfigRoom(h.user, gameName)
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

func (h *Handlers) SubscribeToConfigRoom(gameId model.GameID) error {
	uid := h.user.ID
	if h.subscriptionManager.IsSubscribed(uid) {
		return h.Error(ErrorAlreadySubscribed)
	}

	configRoom, err := model.GetConfigRoom(gameId)
	if err != nil {
		return err
	}
	if configRoom == nil {
		return h.Error(ErrorGameDoesNotExist)
	}

	h.subscriptionManager.Subscribe(h.connection, h.user.ID, gameId, SubscriptionToConfigRoom)
	switch configRoom.Status {
	case model.StatusCreated, model.StatusConfigProposed:
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
		return model.ApplyToCandidates(gameId, func(candidate *model.Candidate) error {
			if candidate.User.ID != uid { // don't send the user to itself twice
				return h.Send(CandidateJoinedMessage{ Candidate: candidate.User })
			}
			return nil;
		})
	case model.StatusStarted, model.StatusFinished:
		// This is a started game. The client is probably joining mid-game. Send the config room so that they know about it
		return h.Send(ConfigRoomUpdateMessage{ GameID: gameId, ConfigRoom: *configRoom })
	}
	return fmt.Errorf("SubscribeConfigRoom fell through the end of the switch while it shouldn't. Game status was %v", configRoom.Status)
}

func (h *Handlers) SubscribeToGame(gameId model.GameID) error {
	if h.subscriptionManager.IsSubscribed(h.user.ID) {
		return h.Error(ErrorAlreadySubscribed)
	}

	game, err := model.GetGame(gameId)
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

	syncEvent := model.GameEvent{
		Time: Now(),
		User: *h.user,
		Data: model.EventDataSync,
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
		configRoom, err := model.GetConfigRoom(gameId)
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

func (h *Handlers) GetSubscribedConfigRoom() (*model.ConfigRoom, error) {
	_, gameId, subscribed := h.subscriptionManager.SubscriptionOf(h.connection)
	if !subscribed {
		return nil, h.Error(ErrorNotSubscribed)
	}

	configRoom, err := model.GetConfigRoom(gameId)
	if err != nil {
		return nil, err
	}
	return configRoom, nil
}

func (h *Handlers) SelectOpponent(opponent *model.MinimalUser) error {
	configRoom, err := h.GetSubscribedConfigRoom()
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

	update := ConfigRoomUpdateMessage{ GameID: configRoom.ID, ConfigRoom: *configRoom }
	err = h.BroadcastToConfigRoom(configRoom.ID, update)
	if err != nil {
		return err
	}

	return h.BroadcastToLobby(update)
}

func (h *Handlers) ProposeConfig(config *model.ConfigProposal) error {
	configRoom, err := h.GetSubscribedConfigRoom()
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

	return h.BroadcastToConfigRoom(configRoom.ID, ConfigRoomUpdateMessage{ GameID: configRoom.ID, ConfigRoom: *configRoom })
}

func (h *Handlers) ReviewConfig() error {
	configRoom, err := h.GetSubscribedConfigRoom()
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

	return h.BroadcastToConfigRoom(configRoom.ID, ConfigRoomUpdateMessage{ GameID: configRoom.ID, ConfigRoom: *configRoom })
}

func (h *Handlers) AcceptConfig() error {
	configRoom, err := h.GetSubscribedConfigRoom()
	if err != nil {
		return err
	}
	if configRoom == nil {
		return h.Error(ErrorUnknownGame)
	}
	if configRoom.ChosenOpponent == nil ||
		configRoom.ChosenOpponent.ID != h.user.ID ||
		configRoom.Status != model.StatusConfigProposed {
		return h.Error(ErrorNotAllowed)
	}

	// Change the config room status to "started"
	err = configRoom.Start()
	if err != nil {
		return err
	}

	// Create the game
	_, err = configRoom.CreateGame(Now(), RandBool())
	if err != nil {
		return err
	}

	// And notify everyone
	update := ConfigRoomUpdateMessage{ GameID: configRoom.ID, ConfigRoom: *configRoom }
	err = h.BroadcastToConfigRoom(configRoom.ID, update)
	if err != nil {
		return err
	}

	return h.BroadcastToLobby(update)
}

func (h *Handlers) GetSubscribedConfigRoomAndGame() (*model.ConfigRoom, *model.Game, error) {
	// TODO: could be done in one transaction
	configRoom, err := h.GetSubscribedConfigRoom()
	if err != nil {
		return nil, nil, err
	}

	game, err := model.GetGame(configRoom.ID)
	if err != nil {
		return nil, nil, err
	}

	return configRoom, game, nil
}

func (h *Handlers) doEndGame(getResult (func(*model.MinimalUser, *model.MinimalUser) model.Result)) error {
	configRoom, game, err := h.GetSubscribedConfigRoomAndGame()
	if err != nil {
		return err
	}
	if configRoom == nil || game == nil {
		return h.Error(ErrorUnknownGame)
	}
	if configRoom.Status != model.StatusStarted ||
		(configRoom.Creator.ID != h.user.ID && configRoom.ChosenOpponent.ID != h.user.ID) {
		// Only a player can finish a game. And they have to play in the game
		return h.Error(ErrorNotAllowed)
	}

	result := getResult(&game.PlayerZero, &game.PlayerOne)
	err = game.SetResult(result)
	if err != nil {
		return err
	}

	var loser *model.MinimalUser
	var winner *model.MinimalUser
	var draw bool
	if result.IsVictoryOfZero() {
		winner = &game.PlayerZero
		loser = &game.PlayerOne
		draw = false
	} else if result.IsVictoryOfOne() {
		winner = &game.PlayerOne
		loser = &game.PlayerZero
		draw = false
	} else if result.IsDraw() {
		// loser/winner is not relevant here, but we need both players
		winner = &game.PlayerZero
		loser = &game.PlayerOne
		draw = true
	} else {
		// Not a finished game!
		return fmt.Errorf("This game is not finished")
	}

	event := model.GameEvent{
		Time: Now(),
		User: *h.user,
		Data: model.EventDataEndGame,
	}
	err = model.AddEvent(game.GameID, event)
	if err != nil {
		return err
	}

	err = ComputeAndUpdateElos(configRoom.GameName, winner, loser, draw)
	if err != nil {
		return err
	}

	err = configRoom.Finish()
	if err != nil {
		return err
	}

	err = h.BroadcastToGame(game.GameID, GameUpdateMessage{Game: *game})
	if err != nil {
		return err
	}

	eventMessage := GameEventMessage{Event: event, ServerTime: NowFloat()}
	err = h.BroadcastToGame(game.GameID, eventMessage)
	if err != nil {
		return err
	}

	return h.BroadcastToLobby(eventMessage)
}

func (h *Handlers) Resign() error {
	return h.doEndGame(func (playerZero *model.MinimalUser, playerOne *model.MinimalUser) model.Result {
		if h.user.ID == playerZero.ID {
			return model.ResultResignOfZero
		} else {
			return model.ResultResignOfOne
		}
	})
}

func (h *Handlers) NotifyTimeout(timeoutedPlayer model.Player) error {
	return h.doEndGame(func (playerZero *model.MinimalUser, playerOne *model.MinimalUser) model.Result {
		if timeoutedPlayer == model.PlayerZero {
			return model.ResultTimeoutOfZero
		} else {
			return model.ResultTimeoutOfOne
		}
	})
}

func (h *Handlers) GameEnd(winner model.PlayerOrNone) error {
	return h.doEndGame(func (playerZero *model.MinimalUser, playerOne *model.MinimalUser) model.Result {
		if winner == model.PlayerOrNoneZero {
			return model.ResultVictoryOfZero
		} else if winner == model.PlayerOrNoneOne {
			return model.ResultVictoryOfOne
		} else {
			return model.ResultHardDraw
		}
	})
}

func (h *Handlers) AddEvent(eventData model.EventData) error {
	_, gameId, subscribed := h.subscriptionManager.SubscriptionOf(h.connection)
	if !subscribed {
		return h.Error(ErrorNotSubscribed)
	}

	event := model.GameEvent{
		Time: Now(),
		User: *h.user,
		Data: eventData,
	}

	err := model.AddEvent(gameId, event)
	if err != nil {
		return err
	}

	return h.BroadcastToGame(gameId, GameEventMessage{
		ServerTime: NowFloat(),
		Event: event,
	})
}

func (h *Handlers) Propose(proposition model.Proposition) error {
	return h.AddEvent(model.EventDataRequest(proposition))
}

func (h *Handlers) Reject(proposition model.Proposition) error {
	return h.AddEvent(model.EventDataReplyReject(proposition))
}

func (h *Handlers) Accept(proposition model.Proposition) error {
	switch proposition {
	case model.PropositionTakeBack:
		// Players will take the take back into account when receiving the event
		return h.AddEvent(model.EventDataReplyAccept(proposition, nil))
	case model.PropositionDraw:
		err := h.doEndGame(func (playerZero *model.MinimalUser, playerOne *model.MinimalUser) model.Result {
			if h.user.ID == playerZero.ID {
				return model.ResultAgreedDrawByZero
			} else {
				return model.ResultAgreedDrawByOne
			}
		})
		if err != nil {
			return err
		}

		return h.AddEvent(model.EventDataReplyAccept(proposition, nil))
	case model.PropositionRematch:
		configRoom, game, err := h.GetSubscribedConfigRoomAndGame()
		if err != nil {
			return err
		}
		// Create the new config room
		rematchConfigRoom, err := model.CreateRematchConfigRoom(h.user, configRoom, game)
		if err != nil {
			return err
		}
		rematchConfigRoom.Start()

		// Create the game
		_, err = rematchConfigRoom.CreateGame(Now(), RandBool())

		// Add a reply event and broadcast it to the players
		rawId, err := json.Marshal(rematchConfigRoom.ID)
		if err != nil {
			return err
		}

		err = h.AddEvent(model.EventDataReplyAccept(proposition, json.RawMessage(rawId)))
		if err != nil {
			return err
		}
		// Broadcast the config room to the lobby
		return h.BroadcastToLobby(ConfigRoomUpdateMessage{
			GameID: rematchConfigRoom.ID,
			ConfigRoom: *rematchConfigRoom,
		})
	}
	return fmt.Errorf("Unknown proposition, should never happen")
}

func (h *Handlers) AddTime(kind model.AddTimeKind) error {
	return h.AddEvent(model.EventDataAddTime(kind))
}

func (h *Handlers) Move(move json.RawMessage) error {
	return h.AddEvent(model.EventDataMove(move))
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
		gameId, err := GetMessageArgument[model.GameID](messageData, "gameId")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.SubscribeToConfigRoom(*gameId)
	case "SubscribeGame":
		gameId, err := GetMessageArgument[model.GameID](messageData, "gameId")
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
		opponent, err := GetMessageArgument[model.MinimalUser](messageData, "opponent")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.SelectOpponent(opponent)
	case "ProposeConfig":
		config, err := GetMessageArgument[model.ConfigProposal](messageData, "config")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.ProposeConfig(config)
	case "ReviewConfig":
		return h.ReviewConfig()
	case "AcceptConfig":
		return h.AcceptConfig()

	case "Resign":
		return h.Resign()
	case "NotifyTimeout":
		timeoutedPlayer, err := GetMessageArgument[model.Player](messageData, "timeoutedPlayer")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.NotifyTimeout(*timeoutedPlayer)
	case "GameEnd":
		winner, err := GetMessageArgument[model.PlayerOrNone](messageData, "winner")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.GameEnd(*winner)
	case "Propose":
		proposition, err := GetMessageArgument[model.Proposition](messageData, "proposition")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.Propose(*proposition)
	case "Reject":
		proposition, err := GetMessageArgument[model.Proposition](messageData, "proposition")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.Reject(*proposition)
	case "Accept":
		proposition, err := GetMessageArgument[model.Proposition](messageData, "proposition")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.Accept(*proposition)
	case "AddTime":
		kind, err := GetMessageArgument[model.AddTimeKind](messageData, "kind")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.AddTime(*kind)
	case "Move":
		move, err := GetMessageArgument[json.RawMessage](messageData, "move")
		if err != nil {
			return h.Error(ErrorInvalidData)
		}
		return h.Move(*move)

	default:
		return h.Error(ErrorUnknownMessage)
	}
}


func (h *Handlers) ClientLeft() error {
	return h.Unsubscribe()
}
