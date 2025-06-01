package internal

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/gorilla/websocket"

	model "github.com/EveryBoard/EveryBoard/internal/model"
)

func NowImpl() int64 {
	return time.Now().Unix()
}

var Now = NowImpl

func NowFloatImpl() float64 {
	return float64(time.Now().UnixNano()) / 1e9
}

var NowFloat = NowFloatImpl

func RandBoolImpl() bool {
	return rand.Intn(2) == 1
}

var RandBool = RandBoolImpl

type Handlers struct {
	connection          *websocket.Conn
	user                model.MinimalUser
}

func sendMessage(connection *websocket.Conn, message OutgoingMessage) error {
	toSend, err := json.Marshal([]any{message.Tag(), message})
	if err != nil {
		return err
	}

	log.Printf(">>> %v", string(toSend))
	err = connection.WriteMessage(websocket.TextMessage, toSend)
	if websocket.IsCloseError(err) || err == websocket.ErrCloseSent {
		return nil // in case the connection has been closed, we will continue with the rest but ignore sent messages
	}
	return err
}

func (h *Handlers) send(message OutgoingMessage) error {
	return sendMessage(h.connection, message)
}

func (h *Handlers) broadcastToUser(user model.MinimalUser, message OutgoingMessage) error {
	for connection := range connectionManager.allUserConnections(user) {
		err := sendMessage(connection, message)
		if err != nil {
			return err
		}
	}
	return nil
}

func (h *Handlers) error(reason Error) error {
	return h.send(ErrorMessage{Reason: reason})
}

// Broadcast sends a message to all clients subscribed to kind, gameId
func (h *Handlers) broadcast(kind SubscriptionKind, gameId model.GameID, message OutgoingMessage) error {
	for connection := range subscriptionManager.subscriptionsTo(kind, gameId) {
		err := sendMessage(connection, message)
		if err != nil {
			return err
		}
	}
	return nil
}

func (h *Handlers) broadcastToConfigRoom(gameId model.GameID, message OutgoingMessage) error {
	return h.broadcast(SubscriptionToConfigRoom, gameId, message)
}

func (h *Handlers) broadcastToLobby(message OutgoingMessage) error {
	return h.broadcast(SubscriptionToLobby, model.GameIDLobby, message)
}

func (h *Handlers) broadcastToGame(gameId model.GameID, message OutgoingMessage) error {
	return h.broadcast(SubscriptionToGame, gameId, message)
}

func (h *Handlers) sendChatMessages(gameId model.GameID) error {
	return model.ApplyToMessagesOfGame(gameId, func(message *model.Message) error {
		return h.send(ChatMessage{Message: *message})
	})
}

func (h *Handlers) sendGameEvents(gameId model.GameID) error {
	return model.ApplyToGameEvents(gameId, func(event *model.GameEvent) error {
		return h.send(GameEventMessage{Event: *event, ServerTime: NowFloat()})
	})
}

func (h *Handlers) sendActiveConfigRooms() error {
	return model.ApplyToConfigRooms(func(configRoom model.ConfigRoom) error {
		return h.send(ConfigRoomUpdateMessage{
			GameID:     configRoom.ID,
			ConfigRoom: configRoom,
		})
	})
}

func (h *Handlers) subscribeToLobby() error {
	uid := h.user.ID
	if subscriptionManager.isSubscribed(uid) {
		return h.error(ErrorAlreadySubscribed)
	}

	subscriptionManager.subscribe(h.connection, uid, model.GameIDLobby, SubscriptionToLobby)
	err := h.sendChatMessages(model.GameIDLobby)
	if err != nil {
		return err
	}

	return h.sendActiveConfigRooms()
}

func (h *Handlers) chatSend(content string) error {
	kind, gameId, subscribed := subscriptionManager.subscriptionOf(h.connection)
	if !subscribed {
		return h.error(ErrorUnknownMessage)
	}

	message := model.Message{
		Sender:    h.user,
		Timestamp: Now(),
		Content:   content,
	}
	err := model.AddChatMessage(gameId, &message)
	if err != nil {
		return err
	}
	return h.broadcast(kind, gameId, ChatMessage{Message: message})
}

func (h *Handlers) setCurrentGame(user model.MinimalUser, currentGame model.CurrentGame) error {
	err := model.SetCurrentGame(user, currentGame)
	if err != nil {
		return err
	}

	return h.broadcastToUser(user, CurrentGameUpdateMessage{ CurrentGame: &currentGame })
}

func (h *Handlers) updateCurrentGame(user model.MinimalUser, currentGame model.CurrentGame) error {
	err := model.UpdateCurrentGame(user, currentGame)
	if err != nil {
		return err
	}

	return h.broadcastToUser(user, CurrentGameUpdateMessage{ CurrentGame: &currentGame })
}

func (h *Handlers) removeCurrentGame(user model.MinimalUser) error {
	err := model.RemoveCurrentGame(user)
	if err != nil {
		return err
	}

	return h.broadcastToUser(user, CurrentGameUpdateMessage{ CurrentGame: nil })
}

func (h *Handlers) createGame(gameName string) error {
	if subscriptionManager.isSubscribed(h.user.ID) {
		return h.error(ErrorAlreadySubscribed)
	}

	// Contrary to other place where checking subscription is enough, we need to
	// check that the creator does not have a current game. They could have
	// created a game, left, and be trying to create a new one.
	currentGame, err := model.GetCurrentGame(h.user)
	if err != nil {
		return err
	}
	if currentGame != nil {
		return h.error(ErrorAlreadySubscribed)
	}

	configRoom, err := model.CreateConfigRoom(h.user, gameName)
	if err != nil {
		return err
	}

	// Send the id to the creator, and the config room to the lobby observers
	err = h.send(GameCreatedMessage{GameId: configRoom.ID})
	if err != nil {
		return err
	}

	// Creator now has a current game, without opponents yet
	err = h.setCurrentGame(h.user, model.CurrentGame{
		GameID: configRoom.ID,
		GameName: gameName,
		Opponent: nil,
		Role: model.UserRoleCreator,
	})
	if err != nil {
		return err
	}

	return h.broadcastToLobby(ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom})
}

func (h *Handlers) subscribeToConfigRoom(gameId model.GameID) error {
	uid := h.user.ID
	if subscriptionManager.isSubscribed(uid) {
		return h.error(ErrorAlreadySubscribed)
	}

	configRoom, err := model.GetConfigRoom(gameId)
	if err != nil {
		return err
	}
	if configRoom == nil {
		return h.error(ErrorGameDoesNotExist)
	}

	subscriptionManager.subscribe(h.connection, h.user.ID, gameId, SubscriptionToConfigRoom)
	switch configRoom.Status {
	case model.StatusCreated, model.StatusConfigProposed:
		// This is a config room in progress
		// Either we have the creator or a candidate

		// For both candidates and creator, send the config room first, then the candidates.
		// The order is important so that the client knows the config room before the candidates
		err = h.send(ConfigRoomUpdateMessage{
			GameID:     gameId,
			ConfigRoom: *configRoom,
		})
		if err != nil {
			return err
		}

		if uid != configRoom.Creator.ID {
			// A new candidate appears!
			// TODO: elo of the candidate while we're at it
			err = configRoom.AddCandidate(h.user)
			if err != nil {
				return err
			}

			// Let the other people in the config room know about it
			err = h.broadcastToConfigRoom(gameId, CandidateJoinedMessage{Candidate: h.user})
			if err != nil {
				return err
			}

			// And set the current game of the candidate
			err = h.setCurrentGame(h.user, model.CurrentGame{
				GameID: gameId,
				GameName: configRoom.GameName,
				Opponent: &configRoom.Creator,
				Role: model.UserRoleCandidate,
			})
			if err != nil {
				return err
			}
		}

		return model.ApplyToCandidates(gameId, func(candidate model.Candidate) error {
			if candidate.User.ID != uid { // don't send the user to itself twice
				return h.send(CandidateJoinedMessage{Candidate: candidate.User})
			}
			return nil
		})
	case model.StatusStarted, model.StatusFinished:
		// This is a started game. The client is probably joining mid-game. Send the config room so that they know about it
		return h.send(ConfigRoomUpdateMessage{GameID: gameId, ConfigRoom: *configRoom})
	}
	return fmt.Errorf("SubscribeConfigRoom fell through the end of the switch while it shouldn't. Game status was %v", configRoom.Status)
}

func (h *Handlers) subscribeToGame(gameId model.GameID) error {
	if subscriptionManager.isSubscribed(h.user.ID) {
		return h.error(ErrorAlreadySubscribed)
	}

	game, err := model.GetGame(gameId)
	if err != nil {
		return err
	}
	if game == nil {
		return h.error(ErrorGameDoesNotExist)
	}

	subscriptionManager.subscribe(h.connection, h.user.ID, gameId, SubscriptionToGame)

	// Let the observers know their current game. The players already know it from game creation
	if game.PlayerZero.ID != h.user.ID && game.PlayerOne.ID != h.user.ID {
		h.setCurrentGame(h.user, model.CurrentGame{
			GameID: gameId,
			GameName: game.GameName,
			Opponent: nil,
			Role: model.UserRoleObserver,
		})
	}

	// It is important to send the game first and then the events so that the
	// client knows about the game before receiving events
	err = h.send(GameUpdateMessage{Game: *game})
	if err != nil {
		return err
	}

	err = h.sendChatMessages(gameId)
	if err != nil {
		return err
	}

	err = h.sendGameEvents(gameId)
	if err != nil {
		return err
	}

	syncEvent := model.GameEvent{
		Time: Now(),
		User: h.user,
		Data: model.EventDataSync,
	}
	return h.send(GameEventMessage{Event: syncEvent, ServerTime: NowFloat()})
}

func (h *Handlers) unsubscribe() error {
	subscriptionKind, gameId, subscribed := subscriptionManager.subscriptionOf(h.connection)
	if !subscribed {
		// They're not subscribed, there's nothing to do
		return nil
	}
	subscriptionManager.unsubscribe(h.connection)

	switch subscriptionKind {
	case SubscriptionToLobby:
		// Leaving the lobby is easy: there's nothing to do
		return nil
	case SubscriptionToGame:
		// Leaving a game: only remove the current game if user was an observer,
		// because anyone is allowed only one subscription at a time, if they observe and unsubscribe, they have no current game.
		// A player however must remain in game, otherwise they could close their tab and join a new game in another tab.
		game, err := model.GetGame(gameId)
		if err != nil {
			return err
		}
		if game.PlayerZero.ID != h.user.ID && game.PlayerOne.ID != h.user.ID {
			return h.removeCurrentGame(h.user)
		}
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
				err = model.DeleteConfigRoom(*configRoom)
				if err != nil {
					return err
				}

				// Let everyone know about it
				update := ConfigRoomDeletedMessage{GameID: configRoom.ID}
				err = h.broadcastToConfigRoom(configRoom.ID, update)
				if err != nil {
					return err
				}

				err = h.broadcastToLobby(update)
				if err != nil {
					return  err
				}

				// Remove current game from all candidates and from creator
				err = model.ApplyToCandidates(configRoom.ID, func (candidate model.Candidate) error {
					return h.removeCurrentGame(candidate.User)
				})
				if err != nil {
					return err
				}

				return h.removeCurrentGame(configRoom.Creator)
			} else {
				// Candidate has left, remove them
				err = configRoom.DeleteCandidate(h.user.ID)
				if err != nil {
					return err
				}

				err = h.broadcastToConfigRoom(configRoom.ID, CandidateLeftMessage{Candidate: h.user})
				if err != nil {
					return err
				}

				// Adapt config room and current game from creator if needed (if candidate was chosen opponent)
				if configRoom.ChosenOpponent != nil && configRoom.ChosenOpponent.ID == h.user.ID {
					err = configRoom.RemoveOpponent()
					if err != nil {
						return err
					}
					err = h.broadcastToConfigRoom(configRoom.ID, ConfigRoomUpdateMessage{
						GameID: configRoom.ID,
						ConfigRoom: *configRoom,
					})
					if err != nil {
						return err
					}

					err = h.updateCurrentGame(configRoom.Creator, model.CurrentGame{
						GameID: configRoom.ID,
						GameName: configRoom.GameName,
						Opponent: nil,
						Role: model.UserRoleCreator,
					})
					if err != nil {
						return err
					}
				}

				return h.removeCurrentGame(h.user)
			}
		} else {
			// If the game has started, we don't remove it and don't have anything else to do
			return nil
		}
	}
	return fmt.Errorf("unsubscribe: fell through all switch cases, which shouldn't happen")
}

func (h *Handlers) getSubscribedConfigRoom() (*model.ConfigRoom, error) {
	_, gameId, subscribed := subscriptionManager.subscriptionOf(h.connection)
	if !subscribed {
		return nil, h.error(ErrorNotSubscribed)
	}

	configRoom, err := model.GetConfigRoom(gameId)
	if err != nil {
		return nil, err
	}
	return configRoom, nil
}

func (h *Handlers) selectOpponent(opponent model.MinimalUser) error {
	configRoom, err := h.getSubscribedConfigRoom()
	if err != nil {
		return err
	}
	if configRoom == nil {
		return h.error(ErrorUnknownGame)
	}
	if configRoom.Creator.ID != h.user.ID {
		return h.error(ErrorNotAllowed)
	}

	err = configRoom.SelectOpponent(opponent)
	if err != nil {
		return err
	}

	// Both players have their current game updated
	err = h.updateCurrentGame(h.user, model.CurrentGame{
		GameID: configRoom.ID,
		GameName: configRoom.GameName,
		Opponent: &opponent,
		Role: model.UserRoleCreator,
	})
	if err != nil {
		return err
	}

	err = h.updateCurrentGame(opponent, model.CurrentGame{
		GameID: configRoom.ID,
		GameName: configRoom.GameName,
		Opponent: &h.user,
		Role: model.UserRoleChosenOpponent,
	})
	if err != nil {
		return err
	}

	update := ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom}
	err = h.broadcastToConfigRoom(configRoom.ID, update)
	if err != nil {
		return err
	}

	return h.broadcastToLobby(update)
}

func (h *Handlers) proposeConfig(config *model.ConfigProposal) error {
	configRoom, err := h.getSubscribedConfigRoom()
	if err != nil {
		return err
	}
	if configRoom == nil {
		return h.error(ErrorUnknownGame)
	}
	if configRoom.Creator.ID != h.user.ID || configRoom.ChosenOpponent == nil {
		return h.error(ErrorNotAllowed)
	}

	err = configRoom.Propose(config)
	if err != nil {
		return err
	}

	return h.broadcastToConfigRoom(configRoom.ID, ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom})
}

func (h *Handlers) reviewConfig() error {
	configRoom, err := h.getSubscribedConfigRoom()
	if err != nil {
		return err
	}
	if configRoom == nil {
		return h.error(ErrorUnknownGame)
	}
	if configRoom.Creator.ID != h.user.ID {
		return h.error(ErrorNotAllowed)
	}

	err = configRoom.Review()
	if err != nil {
		return err
	}

	return h.broadcastToConfigRoom(configRoom.ID, ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom})
}

func (h *Handlers) acceptConfig() error {
	configRoom, err := h.getSubscribedConfigRoom()
	if err != nil {
		return err
	}
	if configRoom == nil {
		return h.error(ErrorUnknownGame)
	}
	if configRoom.ChosenOpponent == nil ||
		configRoom.ChosenOpponent.ID != h.user.ID ||
		configRoom.Status != model.StatusConfigProposed {
		return h.error(ErrorNotAllowed)
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

	// Add its start event
	event := model.GameEvent{
		Time: Now(),
		User: h.user,
		Data: model.EventDataStartGame,
	}
	err = model.AddEvent(configRoom.ID, event)
	if err != nil {
		return err
	}
	// No need to notify the users about this event now, as no one is subscribed yet.
	// They will get it when subscribing.

	// Updates the current game of both players, and remove the current game of all non-chosen candidates
	err = model.ApplyToCandidates(configRoom.ID, func (candidate model.Candidate) error {
		if candidate.User.ID == configRoom.ChosenOpponent.ID {
			return nil // skip the opponent
		}
		return h.removeCurrentGame(candidate.User)
	})
	if err != nil {
		return err
	}

	err = h.updateCurrentGame(configRoom.Creator, model.CurrentGame{
		GameID: configRoom.ID,
		GameName: configRoom.GameName,
		Opponent: configRoom.ChosenOpponent,
		Role: model.UserRolePlayer,
	})
	if err != nil {
		return err
	}

	err = h.updateCurrentGame(*configRoom.ChosenOpponent, model.CurrentGame{
		GameID: configRoom.ID,
		GameName: configRoom.GameName,
		Opponent: &configRoom.Creator,
		Role: model.UserRolePlayer,
	})
	if err != nil {
		return err
	}

	// And notify everyone
	update := ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom}
	err = h.broadcastToConfigRoom(configRoom.ID, update)
	if err != nil {
		return err
	}

	return h.broadcastToLobby(update)
}

func (h *Handlers) getSubscribedConfigRoomAndGame() (*model.ConfigRoom, *model.Game, error) {
	// TODO: could be done in one transaction
	configRoom, err := h.getSubscribedConfigRoom()
	if err != nil {
		return nil, nil, err
	}

	game, err := model.GetGame(configRoom.ID)
	if err != nil {
		return nil, nil, err
	}

	return configRoom, game, nil
}

func (h *Handlers) doEndGame(getResult func(*model.MinimalUser, *model.MinimalUser) model.Result) error {
	configRoom, game, err := h.getSubscribedConfigRoomAndGame()
	if err != nil {
		return err
	}
	if configRoom == nil || game == nil {
		return h.error(ErrorUnknownGame)
	}
	if configRoom.Status != model.StatusStarted ||
		(configRoom.Creator.ID != h.user.ID && configRoom.ChosenOpponent.ID != h.user.ID) {
		// Only a player can finish a game. And they have to play in the game
		return h.error(ErrorNotAllowed)
	}

	result := getResult(&game.PlayerZero, &game.PlayerOne)
	err = game.SetResult(result)
	if err != nil {
		return err
	}

	var loser model.MinimalUser
	var winner model.MinimalUser
	var draw bool
	if result.IsVictoryOfZero() {
		winner = game.PlayerZero
		loser = game.PlayerOne
		draw = false
	} else if result.IsVictoryOfOne() {
		winner = game.PlayerOne
		loser = game.PlayerZero
		draw = false
	} else if result.IsDraw() {
		// loser/winner is not relevant here, but we need both players
		winner = game.PlayerZero
		loser = game.PlayerOne
		draw = true
	} else {
		// Not a finished game!
		return fmt.Errorf("this game is not finished")
	}

	event := model.GameEvent{
		Time: Now(),
		User: h.user,
		Data: model.EventDataEndGame,
	}
	err = model.AddEvent(game.GameID, event)
	if err != nil {
		return err
	}

	err = computeAndUpdateElos(configRoom.GameName, winner, loser, draw)
	if err != nil {
		return err
	}

	err = configRoom.Finish()
	if err != nil {
		return err
	}

	// Remove current game for everyone
	err = h.removeCurrentGame(game.PlayerZero)
	if err != nil {
		return err
	}
	err = h.removeCurrentGame(game.PlayerOne)
	if err != nil {
		return err
	}
	err = model.ApplyToObservers(game.GameID, func (observer model.MinimalUser) error {
		return h.removeCurrentGame(observer)
	})
	if err != nil {
		return err
	}

	err = h.broadcastToGame(game.GameID, GameUpdateMessage{Game: *game})
	if err != nil {
		return err
	}

	eventMessage := GameEventMessage{Event: event, ServerTime: NowFloat()}
	err = h.broadcastToGame(game.GameID, eventMessage)
	if err != nil {
		return err
	}

	return h.broadcastToLobby(eventMessage)
}

func (h *Handlers) resign() error {
	return h.doEndGame(func(playerZero *model.MinimalUser, playerOne *model.MinimalUser) model.Result {
		if h.user.ID == playerZero.ID {
			return model.ResultResignOfZero
		} else {
			return model.ResultResignOfOne
		}
	})
}

func (h *Handlers) notifyTimeout(timeoutedPlayer model.Player) error {
	return h.doEndGame(func(playerZero *model.MinimalUser, playerOne *model.MinimalUser) model.Result {
		if timeoutedPlayer == model.PlayerZero {
			return model.ResultTimeoutOfZero
		} else {
			return model.ResultTimeoutOfOne
		}
	})
}

func (h *Handlers) gameEnd(winner model.PlayerOrNone) error {
	return h.doEndGame(func(playerZero *model.MinimalUser, playerOne *model.MinimalUser) model.Result {
		if winner == model.PlayerOrNoneZero {
			return model.ResultVictoryOfZero
		} else if winner == model.PlayerOrNoneOne {
			return model.ResultVictoryOfOne
		} else {
			return model.ResultHardDraw
		}
	})
}

func (h *Handlers) addEvent(eventData model.EventData) error {
	_, gameId, subscribed := subscriptionManager.subscriptionOf(h.connection)
	if !subscribed {
		return h.error(ErrorNotSubscribed)
	}

	event := model.GameEvent{
		Time: Now(),
		User: h.user,
		Data: eventData,
	}

	err := model.AddEvent(gameId, event)
	if err != nil {
		return err
	}

	return h.broadcastToGame(gameId, GameEventMessage{
		ServerTime: NowFloat(),
		Event:      event,
	})
}

func (h *Handlers) propose(proposition model.Proposition) error {
	return h.addEvent(model.EventDataRequest(proposition))
}

func (h *Handlers) reject(proposition model.Proposition) error {
	return h.addEvent(model.EventDataReplyReject(proposition))
}

func (h *Handlers) accept(proposition model.Proposition) error {
	switch proposition {
	case model.PropositionTakeBack:
		// Players will take the take back into account when receiving the event
		return h.addEvent(model.EventDataReplyAccept(proposition, nil))
	case model.PropositionDraw:
		err := h.doEndGame(func(playerZero *model.MinimalUser, playerOne *model.MinimalUser) model.Result {
			if h.user.ID == playerZero.ID {
				return model.ResultAgreedDrawByZero
			} else {
				return model.ResultAgreedDrawByOne
			}
		})
		if err != nil {
			return err
		}

		return h.addEvent(model.EventDataReplyAccept(proposition, nil))
	case model.PropositionRematch:
		configRoom, game, err := h.getSubscribedConfigRoomAndGame()
		if err != nil {
			return err
		}
		// Create the new config room
		rematchConfigRoom, err := model.CreateRematchConfigRoom(h.user, *configRoom, *game)
		if err != nil {
			return err
		}
		err = rematchConfigRoom.Start()
		if err != nil {
			return err
		}

		// Create the game
		rematchGame, err := rematchConfigRoom.CreateGame(Now(), RandBool())
		if err != nil {
			return err
		}

		// Set the current game of both players
		err = h.setCurrentGame(rematchGame.PlayerZero, model.CurrentGame{
			GameID: rematchGame.GameID,
			GameName: rematchGame.GameName,
			Opponent: &rematchGame.PlayerOne,
			Role: model.UserRolePlayer,
		})
		if err != nil {
			return err
		}
		err = h.setCurrentGame(rematchGame.PlayerOne, model.CurrentGame{
			GameID: rematchGame.GameID,
			GameName: rematchGame.GameName,
			Opponent: &rematchGame.PlayerZero,
			Role: model.UserRolePlayer,
		})
		if err != nil {
			return err
		}

		// Add its start event
		event := model.GameEvent{
			Time: Now(),
			User: h.user,
			Data: model.EventDataStartGame,
		}
		err = model.AddEvent(rematchConfigRoom.ID, event)
		if err != nil {
			return err
		}

		// Add a reply event and broadcast it to the players
		rawId, err := json.Marshal(rematchConfigRoom.ID)
		if err != nil {
			return err
		}

		err = h.addEvent(model.EventDataReplyAccept(proposition, json.RawMessage(rawId)))
		if err != nil {
			return err
		}
		// Broadcast the config room to the lobby
		return h.broadcastToLobby(ConfigRoomUpdateMessage{
			GameID:     rematchConfigRoom.ID,
			ConfigRoom: *rematchConfigRoom,
		})
	}
	return fmt.Errorf("unknown proposition, should never happen")
}

func (h *Handlers) addTime(kind model.AddTimeKind) error {
	return h.addEvent(model.EventDataAddTime(kind))
}

func (h *Handlers) move(move json.RawMessage) error {
	return h.addEvent(model.EventDataMove(move))
}

func getMessageArgument[T interface{}](messageData map[string]json.RawMessage, key string) (*T, error) {
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

func (h *Handlers) handle(messageType string, messageData map[string]json.RawMessage) error {
	switch messageType {
	case "SubscribeLobby":
		return h.subscribeToLobby()
	case "SubscribeConfigRoom":
		gameId, err := getMessageArgument[model.GameID](messageData, "gameId")
		if err != nil {
			return h.error(ErrorInvalidData)
		}
		return h.subscribeToConfigRoom(*gameId)
	case "SubscribeGame":
		gameId, err := getMessageArgument[model.GameID](messageData, "gameId")
		if err != nil {
			return h.error(ErrorInvalidData)
		}
		return h.subscribeToGame(*gameId)
	case "Unsubscribe":
		return h.unsubscribe()

	case "ChatSend":
		content, err := getMessageArgument[string](messageData, "message")
		if err != nil {
			return h.error(ErrorInvalidData)
		}
		return h.chatSend(*content)

	case "Create":
		gameName, err := getMessageArgument[string](messageData, "gameName")
		if err != nil {
			return h.error(ErrorInvalidData)
		}
		return h.createGame(*gameName)
	case "SelectOpponent":
		opponent, err := getMessageArgument[model.MinimalUser](messageData, "opponent")
		if err != nil {
			return h.error(ErrorInvalidData)
		}
		return h.selectOpponent(*opponent)
	case "ProposeConfig":
		config, err := getMessageArgument[model.ConfigProposal](messageData, "config")
		if err != nil {
			return h.error(ErrorInvalidData)
		}
		return h.proposeConfig(config)
	case "ReviewConfig":
		return h.reviewConfig()
	case "AcceptConfig":
		return h.acceptConfig()

	case "Resign":
		return h.resign()
	case "NotifyTimeout":
		timeoutedPlayer, err := getMessageArgument[model.Player](messageData, "timeoutedPlayer")
		if err != nil {
			return h.error(ErrorInvalidData)
		}
		return h.notifyTimeout(*timeoutedPlayer)
	case "EndGame":
		winner, err := getMessageArgument[model.PlayerOrNone](messageData, "winner")
		if err != nil {
			return h.error(ErrorInvalidData)
		}
		return h.gameEnd(*winner)
	case "Propose":
		proposition, err := getMessageArgument[model.Proposition](messageData, "proposition")
		if err != nil {
			return h.error(ErrorInvalidData)
		}
		return h.propose(*proposition)
	case "Reject":
		proposition, err := getMessageArgument[model.Proposition](messageData, "proposition")
		if err != nil {
			return h.error(ErrorInvalidData)
		}
		return h.reject(*proposition)
	case "Accept":
		proposition, err := getMessageArgument[model.Proposition](messageData, "proposition")
		if err != nil {
			return h.error(ErrorInvalidData)
		}
		return h.accept(*proposition)
	case "AddTime":
		kind, err := getMessageArgument[model.AddTimeKind](messageData, "kind")
		if err != nil {
			return h.error(ErrorInvalidData)
		}
		return h.addTime(*kind)
	case "Move":
		move, err := getMessageArgument[json.RawMessage](messageData, "move")
		if err != nil {
			return h.error(ErrorInvalidData)
		}
		return h.move(*move)

	default:
		return h.error(ErrorUnknownMessage)
	}
}

func (h *Handlers) ClientLeft() error {
	return h.unsubscribe()
}
