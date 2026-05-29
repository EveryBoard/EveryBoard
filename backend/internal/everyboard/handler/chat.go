package handler

import (
	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/protocol"
)

const MAX_CHAT_MESSAGE_LENGTH = 128

func (h *Handler) handleChatSend(content string) error {
	kind, gameId, subscribed := h.subscriptions.SubscriptionOf(h.connection)
	// User must be subscribed to send a chat message
	if !subscribed {
		return apperror.ErrorNotSubscribed
	}
	// Chat message should not be too long
	if len(content) > MAX_CHAT_MESSAGE_LENGTH {
		return apperror.ErrorNotAllowed
	}

	message := model.Message{
		Sender:    h.user,
		Timestamp: Now(),
		Content:   content,
	}
	if err := h.store.AddChatMessage(gameId, &message); err != nil {
		return err
	}

	var buf MsgBuffer
	h.bufferBroadcast(&buf, kind, gameId, protocol.ChatMessage{Message: message})
	h.flush(&buf)
	return nil
}
