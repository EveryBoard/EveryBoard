package handler
// TODO: rename to config_room.go

import (
	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/protocol"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/session"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/store"
)

func (h *Handler) handleSubscribeConfigRoom(gameId model.GameID) error {
	uid := h.user.ID
	// Subscribe before the transaction so that addBroadcastToConfigRoom below includes this connection.
	// If the transaction fails, we unsubscribe.
	if !h.subscriptions.Subscribe(h.connection, uid, gameId, session.SubscriptionToConfigRoom) {
		return apperror.ErrorAlreadySubscribed
	}

	var buf MsgBuffer
	err := h.store.Transaction(func(store store.Store) error {
		configRoom, err := store.GetConfigRoom(gameId)
		if err != nil {
			return err
		}
		if configRoom == nil {
			return apperror.ErrorGameDoesNotExist
		}

		switch configRoom.Status {
		case model.StatusCreated, model.StatusConfigProposed:
			buf.addSend(h.connection, protocol.ConfigRoomUpdateMessage{
				GameID:     gameId,
				ConfigRoom: *configRoom,
			})

			if uid != configRoom.Creator.ID {
				elo, err := store.GetElo(configRoom.GameName, h.user)
				if err != nil {
					return err
				}
				if err = store.AddCandidate(configRoom, h.user, elo.CurrentElo); err != nil {
					return err
				}
				currentGame := &model.CurrentGame{
					GameID:   gameId,
					GameName: configRoom.GameName,
					Creator:  configRoom.Creator,
					Opponent: configRoom.ChosenOpponent,
					Role:     model.UserRoleCandidate,
				}
				// h.connection is already subscribed, so this broadcast includes the new user
				h.bufferBroadcastToConfigRoom(&buf, gameId, protocol.CandidateJoinedMessage{Candidate: h.user, Elo: elo.CurrentElo})
				if err = h.setCurrentGame(&buf, store, h.user, currentGame); err != nil {
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
				buf.addSend(h.connection, protocol.CandidateJoinedMessage{Candidate: candidate.User, Elo: elo.CurrentElo})
				return nil
			})

		case model.StatusStarted, model.StatusFinished:
			buf.addSend(h.connection, protocol.ConfigRoomUpdateMessage{GameID: gameId, ConfigRoom: *configRoom})
			return nil
		}

		return apperror.ErrorInternal // Unexpected game status
	})
	if err != nil {
		h.subscriptions.Unsubscribe(h.connection)
		return err
	}

	h.flush(&buf)
	return nil
}

func (h *Handler) handleSelectOpponent(opponent model.MinimalUser) error {
	_, gameId, subscribed := h.subscriptions.SubscriptionOf(h.connection)
	if !subscribed {
		return apperror.ErrorNotSubscribed
	}

	var buf MsgBuffer
	var configRoom *model.ConfigRoom
	err := h.store.Transaction(func(store store.Store) error {
		var err error
		configRoom, err = store.GetConfigRoom(gameId)
		if err != nil {
			return err
		}
		if configRoom == nil {
			return apperror.ErrorGameDoesNotExist
		}
		if configRoom.Creator.ID != h.user.ID || configRoom.Status != model.StatusCreated {
			return apperror.ErrorNotAllowed
		}

		if err = store.SelectOpponent(configRoom, opponent); err != nil {
			return err
		}

		currentGameCreator := &model.CurrentGame{
			GameID:   configRoom.ID,
			GameName: configRoom.GameName,
			Creator:  h.user,
			Opponent: &opponent,
			Role:     model.UserRoleCreator,
		}
		if err = h.updateCurrentGame(&buf, store, h.user, currentGameCreator); err != nil {
			return err
		}

		currentGameOpponent := &model.CurrentGame{
			GameID:   configRoom.ID,
			GameName: configRoom.GameName,
			Creator:  h.user,
			Opponent: &opponent,
			Role:     model.UserRoleChosenOpponent,
		}
		if err = h.updateCurrentGame(&buf, store, opponent, currentGameOpponent); err != nil {
			return err
		}

		update := protocol.ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom}
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

func (h *Handler) handleProposeConfig(config model.ConfigProposal) error {
	_, gameId, subscribed := h.subscriptions.SubscriptionOf(h.connection)
	if !subscribed {
		return apperror.ErrorNotSubscribed
	}

	var buf MsgBuffer
	var configRoom *model.ConfigRoom
	err := h.store.Transaction(func(store store.Store) error {
		var err error
		configRoom, err = store.GetConfigRoom(gameId)
		if err != nil {
			return err
		}
		if configRoom == nil {
			return apperror.ErrorGameDoesNotExist
		}
		if configRoom.Creator.ID != h.user.ID ||
			configRoom.ChosenOpponent == nil ||
			configRoom.Status != model.StatusCreated {
			return apperror.ErrorNotAllowed
		}
		if err := store.ProposeConfig(configRoom, config); err != nil {
			return err
		}
		h.bufferBroadcastToConfigRoom(&buf, configRoom.ID, protocol.ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom})
		return nil
	})
	if err != nil {
		return err
	}

	h.flush(&buf)
	return nil
}

func (h *Handler) handleReviewConfig() error {
	_, gameId, subscribed := h.subscriptions.SubscriptionOf(h.connection)
	if !subscribed {
		return apperror.ErrorNotSubscribed
	}

	var buf MsgBuffer
	var configRoom *model.ConfigRoom
	err := h.store.Transaction(func(store store.Store) error {
		var err error
		configRoom, err = store.GetConfigRoom(gameId)
		if err != nil {
			return err
		}
		if configRoom == nil {
			return apperror.ErrorGameDoesNotExist
		}
		if configRoom.Creator.ID != h.user.ID || configRoom.Status != model.StatusConfigProposed {
			return apperror.ErrorNotAllowed
		}
		if err := store.ReviewConfig(configRoom); err != nil {
			return err
		}
		h.bufferBroadcastToConfigRoom(&buf, configRoom.ID, protocol.ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom})
		return nil
	})
	if err != nil {
		return err
	}

	h.flush(&buf)
	return nil
}

func (h *Handler) handleAcceptConfig() error {
	_, gameId, subscribed := h.subscriptions.SubscriptionOf(h.connection)
	if !subscribed {
		return apperror.ErrorNotSubscribed
	}

	var buf MsgBuffer
	var configRoom *model.ConfigRoom
	err := h.store.Transaction(func(store store.Store) error {
		var err error
		configRoom, err = store.GetConfigRoom(gameId)
		if err != nil {
			return err
		}
		if configRoom == nil {
			return apperror.ErrorGameDoesNotExist
		}
		if configRoom.ChosenOpponent == nil ||
			configRoom.ChosenOpponent.ID != h.user.ID ||
			configRoom.Status != model.StatusConfigProposed {
			return apperror.ErrorNotAllowed
		}

		if err = store.StartConfigRoom(configRoom); err != nil {
			return err
		}

		if _, err = store.CreateGame(configRoom, Now(), RandBool()); err != nil {
			return err
		}

		// Add its start event; no broadcast needed yet, subscribers will receive it on SubscribeGame
		event := &model.GameEvent{
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
			return h.removeCurrentGame(&buf, store, candidate.User)
		}); err != nil {
			return err
		}

		currentGameCreator := &model.CurrentGame{
			GameID:   configRoom.ID,
			GameName: configRoom.GameName,
			Creator:  configRoom.Creator,
			Opponent: configRoom.ChosenOpponent,
			Role:     model.UserRolePlayer,
		}
		if err = h.updateCurrentGame(&buf, store, configRoom.Creator, currentGameCreator); err != nil {
			return err
		}

		currentGameOpponent := &model.CurrentGame{
			GameID:   configRoom.ID,
			GameName: configRoom.GameName,
			Creator:  configRoom.Creator,
			Opponent: configRoom.ChosenOpponent,
			Role:     model.UserRolePlayer,
		}
		if err = h.updateCurrentGame(&buf, store, *configRoom.ChosenOpponent, currentGameOpponent); err != nil {
			return err
		}

		update := protocol.ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom}
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
