package handler

import (
	"encoding/json"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/logger"
)

// TODO: generalize to multiple arguments
func withMessageArgument[T any](
	messageData map[string]json.RawMessage,
	key string,
	handle func(T) error,
) func() error {
	value, err := getMessageArgument[T](messageData, key)
	if err != nil {
		return func() error { return apperror.ErrorInvalidData }
	}
	return func() error { return handle(*value) }
}

func withOptionalMessageArgument[T any](
	messageData map[string]json.RawMessage,
	key string, defaultValue T,
	handle func(T) error,
) func() error {
	_, ok := messageData[key]
	if !ok {
		return func() error { return handle(defaultValue) }
	}
	return withMessageArgument(messageData, key, handle)
}

func (h *Handler) handleWithoutErrorSend(messageType string, messageData map[string]json.RawMessage) error {
	switch messageType {
	case "SubscribeLobby":
		return h.handleSubscribeLobby()
	case "SubscribeConfigRoom":
		return withMessageArgument(messageData, "gameId",
			func (gameId GameId) error {
				return withOptionalMessageArgument(messageData, "botDescription",
					func (h.handleSubscribeConfigRoom)
	case "SubscribeGame":
		return withMessageArgument(messageData, "gameId", h.handleSubscribeGame)
	case "Unsubscribe":
		return h.unsubscribe()
	case "ChatSend":
		return withMessageArgument(messageData, "message", h.handleChatSend)
	case "Create":
		return withMessageArgument(messageData, "gameName", h.handleCreateGame)
	case "SelectOpponent":
		return withMessageArgument(messageData, "opponent", h.handleSelectOpponent)
	case "ProposeConfig":
		return withMessageArgument(messageData, "config", h.handleProposeConfig)
	case "ReviewConfig":
		return h.handleReviewConfig()
	case "AcceptConfig":
		return h.handleAcceptConfig()
	case "Resign":
		return h.handleResign()
	case "NotifyTimeout":
		return withMessageArgument(messageData, "timeoutedPlayer", h.handleNotifyTimeout)
	case "EndGame":
		return withMessageArgument(messageData, "winner", h.handleGameEnd)
	case "Propose":
		return withMessageArgument(messageData, "proposition", h.handlePropose)
	case "Reject":
		return withMessageArgument(messageData, "proposition", h.handleReject)
	case "Accept":
		return withMessageArgument(messageData, "proposition", h.handleAccept)
	case "AddTime":
		return withMessageArgument(messageData, "kind", h.handleAddTime)
	case "Move":
		return withMessageArgument(messageData, "move", h.handleMove)
	default:
		return apperror.ErrorUnknownMessage
	}
}

func (h *Handler) Handle(messageType string, messageData map[string]json.RawMessage) {
	err := RecoverMiddleware(h.user.Name, func() error {
		return h.handleWithoutErrorSend(messageType, messageData)
	})

	if err == nil {
		return
	}
	e, ok := err.(apperror.BackendError)
	if ok {
		h.SendError(e)
		return
	}
	printableData, _ := json.Marshal(messageData)
	logger.Error.Printf("Error when handling %v (%s) message: %v", messageType, printableData, err)
}

func (h *Handler) ClientLeft() error {
	return h.unsubscribe()
}
