package internal

import (
	"encoding/json"
	"fmt"

	model "github.com/EveryBoard/EveryBoard/internal/model"
)

func (h *Handlers) handleSubscribeGame(gameId model.GameID) error {
	// Subscribe before the transaction so broadcasts inside do not include this connection.
	// If the transaction fails, we unsubscribe.
	if !h.subscriptions.Subscribe(h.connection, h.user.ID, gameId, SubscriptionToGame) {
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
			if configRoom == nil {
				return model.ErrorUnknownGame
			}
			cg := &model.CurrentGame{
				GameID:   gameId,
				GameName: game.GameName,
				Creator:  configRoom.Creator,
				Opponent: configRoom.ChosenOpponent,
				Role:     model.UserRoleObserver,
			}
			if err = h.setCurrentGame(&buf, store, h.user, cg); err != nil {
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
		h.subscriptions.Unsubscribe(h.connection)
		return err
	}

	h.flush(&buf)
	return nil
}

func (h *Handlers) doEndGame(getResult func(*model.MinimalUser, *model.MinimalUser) model.Result, extraEvent *model.EventPayload) error {
	_, gameId, subscribed := h.subscriptions.SubscriptionOf(h.connection)
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
		if configRoom.Creator.ID != h.user.ID && (configRoom.ChosenOpponent == nil || configRoom.ChosenOpponent.ID != h.user.ID) {
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
			event := &model.GameEvent{
				Timestamp: Now(),
				User:      h.user,
				Data:      *extraEvent,
			}
			if err = store.AddEvent(game.GameID, event); err != nil {
				return err
			}
			h.bufferBroadcastToGame(&buf, game.GameID, model.GameEventMessage{Event: *event, ServerTime: NowFloat()})
		}

		event := &model.GameEvent{
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
		if err = h.removeCurrentGame(&buf, store, game.PlayerZero); err != nil {
			return err
		}

		if err = h.removeCurrentGame(&buf, store, game.PlayerOne); err != nil {
			return err
		}

		if err = store.ApplyToObservers(game.GameID, func(observer model.MinimalUser) error {
			return h.removeCurrentGame(&buf, store, observer)
		}); err != nil {
			return err
		}

		eventMessage := model.GameEventMessage{Event: *event, ServerTime: NowFloat()}
		h.bufferBroadcastToGame(&buf, game.GameID, model.GameUpdateMessage{Game: *game})
		h.bufferBroadcastToGame(&buf, game.GameID, eventMessage)

		update := model.ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom}
		h.bufferBroadcastToConfigRoom(&buf, configRoom.ID, update)
		h.bufferBroadcastToLobby(&buf, update)
		return nil
	})
	if err != nil {
		return err
	}

	h.flush(&buf)
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

func (h *Handlers) addEvent(eventData model.EventPayload) error {
	_, gameId, subscribed := h.subscriptions.SubscriptionOf(h.connection)
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
		if configRoom.Creator.ID != h.user.ID &&
			(configRoom.ChosenOpponent == nil || configRoom.ChosenOpponent.ID != h.user.ID) {
			// Only a player can add events
			return model.ErrorNotAllowed
		}
		// TODO: user must be in game, game must be started but not finished
		if !eventData.AllowedInConfigRoomStatus(configRoom.Status) {
			return model.ErrorNotAllowed
		}

		event := &model.GameEvent{
			Timestamp: Now(),
			User:      h.user,
			Data:      eventData,
		}
		if err = store.AddEvent(gameId, event); err != nil {
			return err
		}

		h.bufferBroadcastToGame(&buf, gameId, model.GameEventMessage{
			ServerTime: NowFloat(),
			Event:      *event,
		})
		return nil
	})
	if err != nil {
		return err
	}

	h.flush(&buf)
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
		_, gameId, subscribed := h.subscriptions.SubscriptionOf(h.connection)
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
			rematchConfigRoom, err = store.CreateRematch(configRoom, h.user, game)
			if err != nil {
				return err
			}

			// Create the game
			rematchGame, err := store.CreateGame(rematchConfigRoom, Now(), RandBool())
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
			cgZero := &model.CurrentGame{
				GameID:   rematchGame.GameID,
				GameName: rematchGame.GameName,
				Creator:  creator,
				Opponent: &opponent,
				Role:     model.UserRolePlayer,
			}
			if err = h.setCurrentGame(&buf, store, rematchGame.PlayerZero, cgZero); err != nil {
				return err
			}

			cgOne := &model.CurrentGame{
				GameID:   rematchGame.GameID,
				GameName: rematchGame.GameName,
				Creator:  creator,
				Opponent: &opponent,
				Role:     model.UserRolePlayer,
			}
			if err = h.setCurrentGame(&buf, store, rematchGame.PlayerOne, cgOne); err != nil {
				return err
			}

			// Add its start event
			event := &model.GameEvent{
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
			replyEvent := &model.GameEvent{
				Timestamp: Now(),
				User:      h.user,
				Data:      model.EventDataReplyAccept(proposition, json.RawMessage(rawId)),
			}
			if err = store.AddEvent(gameId, replyEvent); err != nil {
				return err
			}
			h.bufferBroadcastToGame(&buf, gameId, model.GameEventMessage{
				ServerTime: NowFloat(),
				Event:      *replyEvent,
			})

			// Broadcast the config room to the lobby
			h.bufferBroadcastToLobby(&buf, model.ConfigRoomUpdateMessage{
				GameID:     rematchConfigRoom.ID,
				ConfigRoom: *rematchConfigRoom,
			})
			return nil
		})
		if err != nil {
			return err
		}

		h.flush(&buf)
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
