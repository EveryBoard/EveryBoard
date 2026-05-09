package internal

import (
	model "github.com/EveryBoard/EveryBoard/internal/model"
)

func (h *Handlers) handleSubscribeLobby() error {
	uid := h.user.ID
	if !h.subscriptions.Subscribe(h.connection, uid, model.GameIDLobby, SubscriptionToLobby) {
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

	h.flush(&buf)
	return nil
}

func (h *Handlers) handleCreateGame(gameName string) error {
	if h.subscriptions.IsSubscribed(h.user.ID) {
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
		if err := h.setCurrentGame(&buf, store, h.user, &newCurrentGame); err != nil {
			return err
		}

		// No need to notify the users about this event now, as no one is subscribed yet.
		// They will get it when subscribing.
		h.bufferBroadcastToLobby(&buf, model.ConfigRoomUpdateMessage{GameID: configRoom.ID, ConfigRoom: *configRoom})
		return nil
	})
	if err != nil {
		return err
	}

	h.flush(&buf)
	return nil
}
