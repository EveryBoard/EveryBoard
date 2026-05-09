package internal

import (
	model "github.com/EveryBoard/EveryBoard/internal/model"
)

func (h *Handlers) handleChatSend(content string) error {
	kind, gameId, subscribed := h.subscriptions.SubscriptionOf(h.connection)
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

		h.bufferBroadcast(&buf, kind, gameId, model.ChatMessage{Message: message})
		return nil
	})
	if err != nil {
		return err
	}

	h.flush(&buf)
	return nil
}
