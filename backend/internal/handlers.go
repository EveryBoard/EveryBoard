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

func sendMessage(connection *websocket.Conn, message model.OutgoingMessage) {
	Connections.SendMessage(connection, message)
}

type Handlers struct {
	connection *websocket.Conn
	user       model.MinimalUser
	store      model.Store
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

func (b *MsgBuffer) addBroadcastToUser(user model.MinimalUser, message model.OutgoingMessage) {
	for conn := range Connections.AllUserConnections(user) {
		b.addSend(conn, message)
	}
}

func (b *MsgBuffer) addBroadcast(kind SubscriptionKind, gameId model.GameID, message model.OutgoingMessage) {
	for conn := range Subscriptions.SubscriptionsTo(kind, gameId) {
		b.addSend(conn, message)
	}
}

func (b *MsgBuffer) addBroadcastToConfigRoom(gameId model.GameID, message model.OutgoingMessage) {
	b.addBroadcast(SubscriptionToConfigRoom, gameId, message)
}

func (b *MsgBuffer) addBroadcastToLobby(message model.OutgoingMessage) {
	b.addBroadcast(SubscriptionToLobby, model.GameIDLobby, message)
}

func (b *MsgBuffer) addBroadcastToGame(gameId model.GameID, message model.OutgoingMessage) {
	b.addBroadcast(SubscriptionToGame, gameId, message)
}

func (b *MsgBuffer) setCurrentGame(store model.Store, user model.MinimalUser, cg model.CurrentGame) error {
	cg.User = user
	if err := store.SetCurrentGame(cg); err != nil {
		return err
	}
	b.addBroadcastToUser(user, model.CurrentGameUpdateMessage{CurrentGame: &cg})
	return nil
}

func (b *MsgBuffer) updateCurrentGame(store model.Store, user model.MinimalUser, cg model.CurrentGame) error {
	if err := store.UpdateCurrentGame(user, cg); err != nil {
		return err
	}
	b.addBroadcastToUser(user, model.CurrentGameUpdateMessage{CurrentGame: &cg})
	return nil
}

func (b *MsgBuffer) removeCurrentGame(store model.Store, user model.MinimalUser) error {
	if err := store.RemoveCurrentGame(user); err != nil {
		return err
	}
	b.addBroadcastToUser(user, model.CurrentGameUpdateMessage{CurrentGame: nil})
	return nil
}

func (b *MsgBuffer) Flush() {
	for _, msg := range b.msgs {
		sendMessage(msg.connection, msg.message)
	}
}

func (h *Handlers) send(message model.OutgoingMessage) {
	sendMessage(h.connection, message)
}

func (h *Handlers) sendError(err model.BackendError) {
	h.send(model.ErrorMessage{Reason: err.Msg})
}

func (h *Handlers) broadcastToUser(user model.MinimalUser, message model.OutgoingMessage) {
	for connection := range Connections.AllUserConnections(user) {
		sendMessage(connection, message)
	}
}

func (h *Handlers) handleSubscribeLobby() error {
	uid := h.user.ID
	if !Subscriptions.Subscribe(h.connection, uid, model.GameIDLobby, SubscriptionToLobby) {
		return model.ErrorAlreadySubscribed
	}

	// A lobby subscriber will receive all lobby messages and active config rooms
	var buf MsgBuffer
	err := h.store.ApplyToMessagesOfGame(model.GameIDLobby, func(message *model.Message) error {
		buf.addSend(h.connection, model.ChatMessage{Message: *message})
		return nil
	})
	if err != nil {
		return err
	}
	err = h.store.ApplyToConfigRooms(func(configRoom model.ConfigRoom) error {
		buf.addSend(h.connection, model.ConfigRoomUpdateMessage{
			GameID:     configRoom.ID,
			ConfigRoom: configRoom,
		})
		return nil
	})
	if err != nil {
		return err
	}

	buf.Flush()
	return nil
}

func (h *Handlers) handleChatSend(content string) error {
	kind, gameId, subscribed := Subscriptions.SubscriptionOf(h.connection)
	if !subscribed {
		return model.ErrorNotSubscribed
	}
	if len(content) > 128 {
		return model.ErrorNotAllowed
	}

	var buf MsgBuffer
	err := h.store.Transaction(func(store model.Store) error {
		message := model.Message{
			Sender:    h.user,
			Timestamp: Now(),
			Content:   content,
		}
		err := store.AddChatMessage(gameId, &message)
		if err != nil {
			return err
		}

		buf.addBroadcast(kind, gameId, model.ChatMessage{Message: message})
		return nil
	})
	if err != nil {
		return err
	}

	buf.Flush()
	return nil
}

func (h *Handlers) handleCreateGame(gameName string) error {
	if Subscriptions.IsSubscribed(h.user.ID) {
		return model.ErrorAlreadySubscribed
	}

	var configRoom *model.ConfigRoom
	var buf MsgBuffer
	err := h.store.Transaction(func(store model.Store) error {
		// Contrary to other places where checking subscription is enough, we need to
		// check that the creator does not have a current game. They could have
		// created a game, left, and be trying to create a new one.
		currentGame, err := store.GetCurrentGame(h.user)
		if err != nil {
			return err
		}
		if currentGame != nil {
			return model.ErrorAlreadySubscribed
		}

		configRoom, err = store.CreateConfigRoom(h.user, gameName)
		if err != nil {
			return err
		}

		newCurrentGame := model.CurrentGame{
			GameID:   configRoom.ID,
			GameName: gameName,
			Creator:  h.user,
			Opponent: nil,
			Role:     model.UserRoleCreator,
		}

		buf.addSend(h.connection, model.GameCreatedMessage{GameID: configRoom.ID})
		if err := buf.setCurrentGame(store, h.user, newCurrentGame); err != nil {
			return err
		}

		// No need to notify the users about this event now, as no one is subscribed yet.
		// They will get it when subscribing.
		buf.addBroadcastToLobby(model.ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom})
		return nil
	})
	if err != nil {
		return err
	}

	buf.Flush()
	return nil
}

func (h *Handlers) handleSubscribeConfigRoom(gameId model.GameID) error {
	uid := h.user.ID
	// Subscribe before the transaction so that addBroadcastToConfigRoom below includes this connection.
	// If the transaction fails, we unsubscribe.
	if !Subscriptions.Subscribe(h.connection, uid, gameId, SubscriptionToConfigRoom) {
		return model.ErrorAlreadySubscribed
	}

	var buf MsgBuffer
	err := h.store.Transaction(func(store model.Store) error {
		configRoom, err := store.GetConfigRoom(gameId)
		if err != nil {
			return err
		}
		if configRoom == nil {
			return model.ErrorGameDoesNotExist
		}

		switch configRoom.Status {
		case model.StatusCreated, model.StatusConfigProposed:
			buf.addSend(h.connection, model.ConfigRoomUpdateMessage{
				GameID:     gameId,
				ConfigRoom: *configRoom,
			})

			if uid != configRoom.Creator.ID {
				elo, err := store.GetElo(configRoom.GameName, h.user)
				if err != nil {
					return err
				}
				if err = store.AddCandidate(*configRoom, h.user, elo.CurrentElo); err != nil {
					return err
				}
				currentGame := model.CurrentGame{
					GameID:   gameId,
					GameName: configRoom.GameName,
					Creator:  configRoom.Creator,
					Opponent: configRoom.ChosenOpponent,
					Role:     model.UserRoleCandidate,
				}
				// h.connection is already subscribed, so this broadcast includes the new user
				buf.addBroadcastToConfigRoom(gameId, model.CandidateJoinedMessage{Candidate: h.user, Elo: elo.CurrentElo})
				if err = buf.setCurrentGame(store, h.user, currentGame); err != nil {
					return err
				}
			}

			return store.ApplyToCandidates(gameId, func(candidate model.Candidate) error {
				if candidate.User.ID == uid {
					return nil
				}
				elo, err := store.GetElo(configRoom.GameName, candidate.User)
				if err != nil {
					return err
				}
				buf.addSend(h.connection, model.CandidateJoinedMessage{Candidate: candidate.User, Elo: elo.CurrentElo})
				return nil
			})

		case model.StatusStarted, model.StatusFinished:
			buf.addSend(h.connection, model.ConfigRoomUpdateMessage{GameID: gameId, ConfigRoom: *configRoom})
			return nil
		}

		return fmt.Errorf("subscribeToConfigRoom: unexpected game status %v", configRoom.Status)
	})
	if err != nil {
		Subscriptions.Unsubscribe(h.connection)
		return err
	}

	buf.Flush()
	return nil
}

func (h *Handlers) handleSubscribeGame(gameId model.GameID) error {
	// Subscribe before the transaction so broadcasts inside do not include this connection.
	// If the transaction fails, we unsubscribe.
	if !Subscriptions.Subscribe(h.connection, h.user.ID, gameId, SubscriptionToGame) {
		return model.ErrorAlreadySubscribed
	}

	var buf MsgBuffer
	err := h.store.Transaction(func(store model.Store) error {
		game, err := store.GetGame(gameId)
		if err != nil {
			return err
		}
		if game == nil {
			return model.ErrorGameDoesNotExist
		}

		// Let observers know their current game; players already know from game creation
		if game.PlayerZero.ID != h.user.ID && game.PlayerOne.ID != h.user.ID {
			configRoom, err := store.GetConfigRoom(gameId)
			if err != nil {
				return err
			}
			cg := model.CurrentGame{
				GameID:   gameId,
				GameName: game.GameName,
				Creator:  configRoom.Creator,
				Opponent: configRoom.ChosenOpponent,
				Role:     model.UserRoleObserver,
			}
			if err = buf.setCurrentGame(store, h.user, cg); err != nil {
				return err
			}
		}

		// Send game first so the client knows about it before receiving events
		buf.addSend(h.connection, model.GameUpdateMessage{Game: *game})

		if err = store.ApplyToMessagesOfGame(gameId, func(message *model.Message) error {
			buf.addSend(h.connection, model.ChatMessage{Message: *message})
			return nil
		}); err != nil {
			return err
		}

		if err = store.ApplyToGameEvents(gameId, func(event *model.GameEvent) error {
			buf.addSend(h.connection, model.GameEventMessage{Event: *event, ServerTime: NowFloat()})
			return nil
		}); err != nil {
			return err
		}

		syncEvent := model.GameEvent{
			Timestamp: Now(),
			User:      h.user,
			Data:      model.EventDataSync,
		}
		buf.addSend(h.connection, model.GameEventMessage{Event: syncEvent, ServerTime: NowFloat()})
		return nil
	})
	if err != nil {
		Subscriptions.Unsubscribe(h.connection)
		return err
	}

	buf.Flush()
	return nil
}

func (h *Handlers) unsubscribe() error {
	subscriptionKind, gameId, subscribed := Subscriptions.SubscriptionOf(h.connection)
	if !subscribed {
		return nil
	}
	// Unsubscribe before the transaction so broadcasts inside do not include this connection
	Subscriptions.Unsubscribe(h.connection)

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
			// Only remove the current game for observers; players must remain in game
			// even if they close their tab, so they can't join a new game in another tab
			if game.PlayerZero.ID != h.user.ID && game.PlayerOne.ID != h.user.ID {
				if err = buf.removeCurrentGame(store, h.user); err != nil {
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
				if err = store.DeleteConfigRoom(*configRoom); err != nil {
					return err
				}

				update := model.ConfigRoomDeletedMessage{GameID: configRoom.ID}
				buf.addBroadcastToConfigRoom(configRoom.ID, update)
				buf.addBroadcastToLobby(update)

				if err = store.ApplyToCandidates(configRoom.ID, func(candidate model.Candidate) error {
					return buf.removeCurrentGame(store, candidate.User)
				}); err != nil {
					return err
				}

				return buf.removeCurrentGame(store, configRoom.Creator)

			} else {
				if err = store.DeleteCandidate(*configRoom, h.user.ID); err != nil {
					return err
				}
				buf.addBroadcastToConfigRoom(configRoom.ID, model.CandidateLeftMessage{Candidate: h.user})

				if configRoom.ChosenOpponent != nil && configRoom.ChosenOpponent.ID == h.user.ID {
					if err = store.RemoveOpponent(configRoom); err != nil {
						return err
					}
					buf.addBroadcastToConfigRoom(configRoom.ID, model.ConfigRoomUpdateMessage{
						GameID:     configRoom.ID,
						ConfigRoom: *configRoom,
					})
					newCreatorGame := model.CurrentGame{
						GameID:   configRoom.ID,
						GameName: configRoom.GameName,
						Creator:  configRoom.Creator,
						Opponent: nil,
						Role:     model.UserRoleCreator,
					}
					if err = buf.updateCurrentGame(store, configRoom.Creator, newCreatorGame); err != nil {
						return err
					}
				}

				return buf.removeCurrentGame(store, h.user)
			}
		}

		return fmt.Errorf("unsubscribe: fell through all switch cases, which shouldn't happen")
	})
	if err != nil {
		return err
	}

	buf.Flush()
	return nil
}

func (h *Handlers) handleSelectOpponent(opponent model.MinimalUser) error {
	_, gameId, subscribed := Subscriptions.SubscriptionOf(h.connection)
	if !subscribed {
		return model.ErrorNotSubscribed
	}

	var buf MsgBuffer
	var configRoom *model.ConfigRoom
	err := h.store.Transaction(func(store model.Store) error {
		var err error
		configRoom, err = store.GetConfigRoom(gameId)
		if err != nil {
			return err
		}
		if configRoom == nil {
			return model.ErrorGameDoesNotExist
		}
		if configRoom.Creator.ID != h.user.ID || configRoom.Status != model.StatusCreated {
			return model.ErrorNotAllowed
		}

		if err = store.SelectOpponent(configRoom, opponent); err != nil {
			return err
		}

		currentGameCreator := model.CurrentGame{
			GameID:   configRoom.ID,
			GameName: configRoom.GameName,
			Creator:  h.user,
			Opponent: &opponent,
			Role:     model.UserRoleCreator,
		}
		if err = buf.updateCurrentGame(store, h.user, currentGameCreator); err != nil {
			return err
		}

		currentGameOpponent := model.CurrentGame{
			GameID:   configRoom.ID,
			GameName: configRoom.GameName,
			Creator:  h.user,
			Opponent: &opponent,
			Role:     model.UserRoleChosenOpponent,
		}
		if err = buf.updateCurrentGame(store, opponent, currentGameOpponent); err != nil {
			return err
		}

		update := model.ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom}
		buf.addBroadcastToConfigRoom(configRoom.ID, update)
		buf.addBroadcastToLobby(update)
		return nil
	})
	if err != nil {
		return err
	}

	buf.Flush()
	return nil
}

func (h *Handlers) handleProposeConfig(config model.ConfigProposal) error {
	_, gameId, subscribed := Subscriptions.SubscriptionOf(h.connection)
	if !subscribed {
		return model.ErrorNotSubscribed
	}

	var buf MsgBuffer
	var configRoom *model.ConfigRoom
	err := h.store.Transaction(func(store model.Store) error {
		var err error
		configRoom, err = store.GetConfigRoom(gameId)
		if err != nil {
			return err
		}
		if configRoom == nil {
			return model.ErrorGameDoesNotExist
		}
		if configRoom.Creator.ID != h.user.ID ||
			configRoom.ChosenOpponent == nil ||
			configRoom.Status != model.StatusCreated {
			return model.ErrorNotAllowed
		}
		if err := store.ProposeConfig(configRoom, config); err != nil {
			return err
		}
		buf.addBroadcastToConfigRoom(configRoom.ID, model.ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom})
		return nil
	})
	if err != nil {
		return err
	}

	buf.Flush()
	return nil
}

func (h *Handlers) handleReviewConfig() error {
	_, gameId, subscribed := Subscriptions.SubscriptionOf(h.connection)
	if !subscribed {
		return model.ErrorNotSubscribed
	}

	var buf MsgBuffer
	var configRoom *model.ConfigRoom
	err := h.store.Transaction(func(store model.Store) error {
		var err error
		configRoom, err = store.GetConfigRoom(gameId)
		if err != nil {
			return err
		}
		if configRoom == nil {
			return model.ErrorGameDoesNotExist
		}
		if configRoom.Creator.ID != h.user.ID || configRoom.Status != model.StatusConfigProposed {
			return model.ErrorNotAllowed
		}
		if err := store.ReviewConfig(configRoom); err != nil {
			return err
		}
		buf.addBroadcastToConfigRoom(configRoom.ID, model.ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom})
		return nil
	})
	if err != nil {
		return err
	}

	buf.Flush()
	return nil
}

func (h *Handlers) handleAcceptConfig() error {
	_, gameId, subscribed := Subscriptions.SubscriptionOf(h.connection)
	if !subscribed {
		return model.ErrorNotSubscribed
	}

	var buf MsgBuffer
	var configRoom *model.ConfigRoom
	err := h.store.Transaction(func(store model.Store) error {
		var err error
		configRoom, err = store.GetConfigRoom(gameId)
		if err != nil {
			return err
		}
		if configRoom == nil {
			return model.ErrorGameDoesNotExist
		}
		if configRoom.ChosenOpponent == nil ||
			configRoom.ChosenOpponent.ID != h.user.ID ||
			configRoom.Status != model.StatusConfigProposed {
			return model.ErrorNotAllowed
		}

		if err = store.StartConfigRoom(configRoom); err != nil {
			return err
		}

		if _, err = store.CreateGame(*configRoom, Now(), RandBool()); err != nil {
			return err
		}

		// Add its start event; no broadcast needed yet, subscribers will receive it on SubscribeGame
		event := model.GameEvent{
			Timestamp: Now(),
			User:      h.user,
			Data:      model.EventDataStartGame,
		}
		if err = store.AddEvent(configRoom.ID, event); err != nil {
			return err
		}

		// Updates the current game of both players, and remove the current game of all non-chosen candidates
		if err = store.ApplyToCandidates(configRoom.ID, func(candidate model.Candidate) error {
			if candidate.User.ID == configRoom.ChosenOpponent.ID {
				return nil
			}
			return buf.removeCurrentGame(store, candidate.User)
		}); err != nil {
			return err
		}

		currentGameCreator := model.CurrentGame{
			GameID:   configRoom.ID,
			GameName: configRoom.GameName,
			Creator:  configRoom.Creator,
			Opponent: configRoom.ChosenOpponent,
			Role:     model.UserRolePlayer,
		}
		if err = buf.updateCurrentGame(store, configRoom.Creator, currentGameCreator); err != nil {
			return err
		}

		currentGameOpponent := model.CurrentGame{
			GameID:   configRoom.ID,
			GameName: configRoom.GameName,
			Creator:  configRoom.Creator,
			Opponent: configRoom.ChosenOpponent,
			Role:     model.UserRolePlayer,
		}
		if err = buf.updateCurrentGame(store, *configRoom.ChosenOpponent, currentGameOpponent); err != nil {
			return err
		}

		update := model.ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom}
		buf.addBroadcastToConfigRoom(configRoom.ID, update)
		buf.addBroadcastToLobby(update)
		return nil
	})
	if err != nil {
		return err
	}

	buf.Flush()
	return nil
}

func (h *Handlers) doEndGame(getResult func(*model.MinimalUser, *model.MinimalUser) model.Result, extraEvent *model.EventData) error {
	_, gameId, subscribed := Subscriptions.SubscriptionOf(h.connection)
	if !subscribed {
		return model.ErrorNotSubscribed
	}

	var buf MsgBuffer
	err := h.store.Transaction(func(store model.Store) error {
		configRoom, err := store.GetConfigRoom(gameId)
		if err != nil {
			return err
		}
		game, err := store.GetGame(gameId)
		if err != nil {
			return err
		}
		if configRoom == nil || game == nil {
			return model.ErrorUnknownGame
		}
		if configRoom.Creator.ID != h.user.ID && configRoom.ChosenOpponent.ID != h.user.ID {
			// Only a player can finish a game. And they have to play in the game
			return model.ErrorNotAllowed
		}

		result := getResult(&game.PlayerZero, &game.PlayerOne)
		switch {
		case configRoom.Status == model.StatusStarted:
			// first player to notify the end game, all good
		case configRoom.Status == model.StatusFinished && result.IsTimeout():
			// second player to notify the timeout, so we ignore this one
			return nil
		default:
			// any other case is not allowed
			return model.ErrorNotAllowed
		}

		if err = store.SetGameResult(game, result); err != nil {
			return err
		}

		var loser model.MinimalUser
		var winner model.MinimalUser
		var draw bool
		if result.IsVictoryOfZero() {
			winner = game.PlayerZero
			loser = game.PlayerOne
		} else if result.IsVictoryOfOne() {
			winner = game.PlayerOne
			loser = game.PlayerZero
		} else if result.IsDraw() {
			winner = game.PlayerZero
			loser = game.PlayerOne
			draw = true
		} else {
			return fmt.Errorf("doEndGame: game result is not finished")
		}

		if extraEvent != nil {
			event := model.GameEvent{
				Timestamp: Now(),
				User:      h.user,
				Data:      *extraEvent,
			}
			if err = store.AddEvent(game.GameID, event); err != nil {
				return err
			}
			buf.addBroadcastToGame(game.GameID, model.GameEventMessage{Event: event, ServerTime: NowFloat()})
		}

		event := model.GameEvent{
			Timestamp: Now(),
			User:      h.user,
			Data:      model.EventDataEndGame,
		}
		if err = store.AddEvent(game.GameID, event); err != nil {
			return err
		}

		if err = computeAndUpdateElos(store, configRoom.GameName, winner, loser, draw); err != nil {
			return err
		}

		if err = store.FinishConfigRoom(configRoom); err != nil {
			return err
		}

		// Remove current game for everyone
		if err = buf.removeCurrentGame(store, game.PlayerZero); err != nil {
			return err
		}

		if err = buf.removeCurrentGame(store, game.PlayerOne); err != nil {
			return err
		}

		if err = store.ApplyToObservers(game.GameID, func(observer model.MinimalUser) error {
			return buf.removeCurrentGame(store, observer)
		}); err != nil {
			return err
		}

		eventMessage := model.GameEventMessage{Event: event, ServerTime: NowFloat()}
		buf.addBroadcastToGame(game.GameID, model.GameUpdateMessage{Game: *game})
		buf.addBroadcastToGame(game.GameID, eventMessage)

		update := model.ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom}
		buf.addBroadcastToConfigRoom(configRoom.ID, update)
		buf.addBroadcastToLobby(update)
		return nil
	})
	if err != nil {
		return err
	}

	buf.Flush()
	return nil
}

func (h *Handlers) handleResign() error {
	return h.doEndGame(func(playerZero *model.MinimalUser, playerOne *model.MinimalUser) model.Result {
		if h.user.ID == playerZero.ID {
			return model.ResultResignOfZero
		}
		return model.ResultResignOfOne
	}, nil)
}

func (h *Handlers) handleNotifyTimeout(timeoutedPlayer model.Player) error {
	return h.doEndGame(func(playerZero *model.MinimalUser, playerOne *model.MinimalUser) model.Result {
		if timeoutedPlayer == model.PlayerZero {
			return model.ResultTimeoutOfZero
		}
		return model.ResultTimeoutOfOne
	}, nil)
}

func (h *Handlers) handleGameEnd(winner model.PlayerOrNone) error {
	return h.doEndGame(func(playerZero *model.MinimalUser, playerOne *model.MinimalUser) model.Result {
		switch winner {
		case model.PlayerOrNoneZero:
			return model.ResultVictoryOfZero
		case model.PlayerOrNoneOne:
			return model.ResultVictoryOfOne
		default:
			return model.ResultHardDraw
		}
	}, nil)
}

func (h *Handlers) addEvent(eventData model.EventData) error {
	_, gameId, subscribed := Subscriptions.SubscriptionOf(h.connection)
	if !subscribed {
		return model.ErrorNotSubscribed
	}

	var buf MsgBuffer
	err := h.store.Transaction(func(store model.Store) error {
		configRoom, err := store.GetConfigRoom(gameId)
		if err != nil {
			return err
		}
		if configRoom == nil {
			return model.ErrorUnknownGame
		}
		game, err := store.GetGame(gameId)
		if err != nil {
			return err
		}
		if game == nil {
			return model.ErrorUnknownGame
		}
		if configRoom.Creator.ID != h.user.ID && configRoom.ChosenOpponent.ID != h.user.ID {
			// Only a player can add events
			return model.ErrorNotAllowed
		}
		// TODO: user must be in game, game must be started but not finished
		if !eventData.AllowedInConfigRoomStatus(configRoom.Status) {
			return model.ErrorNotAllowed
		}

		event := model.GameEvent{
			Timestamp: Now(),
			User:      h.user,
			Data:      eventData,
		}
		if err = store.AddEvent(gameId, event); err != nil {
			return err
		}

		buf.addBroadcastToGame(gameId, model.GameEventMessage{
			ServerTime: NowFloat(),
			Event:      event,
		})
		return nil
	})
	if err != nil {
		return err
	}

	buf.Flush()
	return nil
}

func (h *Handlers) handlePropose(proposition model.Proposition) error {
	return h.addEvent(model.EventDataRequest(proposition))
}

func (h *Handlers) handleReject(proposition model.Proposition) error {
	return h.addEvent(model.EventDataReplyReject(proposition))
}

func (h *Handlers) handleAccept(proposition model.Proposition) error {
	switch proposition {
	case model.PropositionTakeBack:
		return h.addEvent(model.EventDataReplyAccept(proposition, nil))

	case model.PropositionDraw:
		extraEvent := model.EventDataReplyAccept(proposition, nil)
		return h.doEndGame(func(playerZero *model.MinimalUser, playerOne *model.MinimalUser) model.Result {
			if h.user.ID == playerZero.ID {
				return model.ResultAgreedDrawByZero
			}
			return model.ResultAgreedDrawByOne
		}, &extraEvent)

	case model.PropositionRematch:
		_, gameId, subscribed := Subscriptions.SubscriptionOf(h.connection)
		if !subscribed {
			return model.ErrorNotSubscribed
		}

		var rematchConfigRoom *model.ConfigRoom
		var buf MsgBuffer
		err := h.store.Transaction(func(store model.Store) error {
			configRoom, err := store.GetConfigRoom(gameId)
			if err != nil {
				return err
			}
			if configRoom == nil {
				return model.ErrorUnknownGame
			}
			if configRoom.Status != model.StatusFinished {
				// Only a finished game can lead to a rematch
				return model.ErrorNotAllowed
			}
			if configRoom.ChosenOpponent == nil ||
				(configRoom.Creator.ID != h.user.ID && configRoom.ChosenOpponent.ID != h.user.ID) {
				// only a player can accept the rematch
				return model.ErrorNotAllowed
			}
			game, err := store.GetGame(gameId)
			if err != nil {
				return err
			}
			if game == nil {
				return model.ErrorUnknownGame
			}

			// Create the new config room
			rematchConfigRoom, err = store.CreateRematch(*configRoom, h.user, *game)
			if err != nil {
				return err
			}

			// Create the game
			rematchGame, err := store.CreateGame(*rematchConfigRoom, Now(), RandBool())
			if err != nil {
				return err
			}

			creator := h.user
			var opponent model.MinimalUser
			if creator.ID == rematchGame.PlayerZero.ID {
				opponent = rematchGame.PlayerOne
			} else {
				opponent = rematchGame.PlayerZero
			}

			// Set the current game of both players
			cgZero := model.CurrentGame{
				GameID:   rematchGame.GameID,
				GameName: rematchGame.GameName,
				Creator:  creator,
				Opponent: &opponent,
				Role:     model.UserRolePlayer,
			}
			if err = buf.setCurrentGame(store, rematchGame.PlayerZero, cgZero); err != nil {
				return err
			}

			cgOne := model.CurrentGame{
				GameID:   rematchGame.GameID,
				GameName: rematchGame.GameName,
				Creator:  creator,
				Opponent: &opponent,
				Role:     model.UserRolePlayer,
			}
			if err = buf.setCurrentGame(store, rematchGame.PlayerOne, cgOne); err != nil {
				return err
			}

			// Add its start event
			event := model.GameEvent{
				Timestamp: Now(),
				User:      h.user,
				Data:      model.EventDataStartGame,
			}
			if err = store.AddEvent(rematchConfigRoom.ID, event); err != nil {
				return err
			}

			// Add a reply event and broadcast it to the current game players
			rawId, err := json.Marshal(rematchConfigRoom.ID)
			if err != nil {
				return err
			}
			replyEvent := model.GameEvent{
				Timestamp: Now(),
				User:      h.user,
				Data:      model.EventDataReplyAccept(proposition, json.RawMessage(rawId)),
			}
			if err = store.AddEvent(gameId, replyEvent); err != nil {
				return err
			}
			buf.addBroadcastToGame(gameId, model.GameEventMessage{
				ServerTime: NowFloat(),
				Event:      replyEvent,
			})

			// Broadcast the config room to the lobby
			buf.addBroadcastToLobby(model.ConfigRoomUpdateMessage{
				GameID:     rematchConfigRoom.ID,
				ConfigRoom: *rematchConfigRoom,
			})
			return nil
		})
		if err != nil {
			return err
		}

		buf.Flush()
		return nil
	}

	return fmt.Errorf("accept: unknown proposition, should never happen")
}

func (h *Handlers) handleAddTime(kind model.AddTimeKind) error {
	return h.addEvent(model.EventDataAddTime(kind))
}

func (h *Handlers) handleMove(move json.RawMessage) error {
	return h.addEvent(model.EventDataMove(move))
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

func (h *Handlers) handleWithoutErrorSend(messageType string, messageData map[string]json.RawMessage) error {
	switch messageType {
	case "SubscribeLobby":
		return h.handleSubscribeLobby()
	case "SubscribeConfigRoom":
		gameId, err := getMessageArgument[model.GameID](messageData, "gameId")
		if err != nil {
			return model.ErrorInvalidData
		}
		return h.handleSubscribeConfigRoom(*gameId)
	case "SubscribeGame":
		gameId, err := getMessageArgument[model.GameID](messageData, "gameId")
		if err != nil {
			return model.ErrorInvalidData
		}
		return h.handleSubscribeGame(*gameId)
	case "Unsubscribe":
		return h.unsubscribe()
	case "ChatSend":
		content, err := getMessageArgument[string](messageData, "message")
		if err != nil {
			return model.ErrorInvalidData
		}
		return h.handleChatSend(*content)
	case "Create":
		gameName, err := getMessageArgument[string](messageData, "gameName")
		if err != nil {
			return model.ErrorInvalidData
		}
		return h.handleCreateGame(*gameName)
	case "SelectOpponent":
		opponent, err := getMessageArgument[model.MinimalUser](messageData, "opponent")
		if err != nil {
			return model.ErrorInvalidData
		}
		return h.handleSelectOpponent(*opponent)
	case "ProposeConfig":
		config, err := getMessageArgument[model.ConfigProposal](messageData, "config")
		if err != nil {
			return model.ErrorInvalidData
		}
		return h.handleProposeConfig(*config)
	case "ReviewConfig":
		return h.handleReviewConfig()
	case "AcceptConfig":
		return h.handleAcceptConfig()
	case "Resign":
		return h.handleResign()
	case "NotifyTimeout":
		timeoutedPlayer, err := getMessageArgument[model.Player](messageData, "timeoutedPlayer")
		if err != nil {
			return model.ErrorInvalidData
		}
		return h.handleNotifyTimeout(*timeoutedPlayer)
	case "EndGame":
		winner, err := getMessageArgument[model.PlayerOrNone](messageData, "winner")
		if err != nil {
			return model.ErrorInvalidData
		}
		return h.handleGameEnd(*winner)
	case "Propose":
		proposition, err := getMessageArgument[model.Proposition](messageData, "proposition")
		if err != nil {
			return model.ErrorInvalidData
		}
		return h.handlePropose(*proposition)
	case "Reject":
		proposition, err := getMessageArgument[model.Proposition](messageData, "proposition")
		if err != nil {
			return model.ErrorInvalidData
		}
		return h.handleReject(*proposition)
	case "Accept":
		proposition, err := getMessageArgument[model.Proposition](messageData, "proposition")
		if err != nil {
			return model.ErrorInvalidData
		}
		return h.handleAccept(*proposition)
	case "AddTime":
		kind, err := getMessageArgument[model.AddTimeKind](messageData, "kind")
		if err != nil {
			return model.ErrorInvalidData
		}
		return h.handleAddTime(*kind)
	case "Move":
		move, err := getMessageArgument[json.RawMessage](messageData, "move")
		if err != nil {
			return model.ErrorInvalidData
		}
		return h.handleMove(*move)
	default:
		return model.ErrorUnknownMessage
	}
}

func (h *Handlers) handle(messageType string, messageData map[string]json.RawMessage) error {
	err := h.handleWithoutErrorSend(messageType, messageData)
	if err == nil {
		return nil
	}
	e, ok := err.(model.BackendError)
	if ok {
		h.sendError(e)
		return nil
	}
	return err
}

func (h *Handlers) clientLeft() error {
	return h.unsubscribe()
}
