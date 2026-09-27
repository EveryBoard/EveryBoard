package handler

import (
	"encoding/json"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/logger"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
)

type subscribeConfigRoomPayload struct {
	GameID        model.GameID         `json:"gameId"`
	BotIdentifier *model.BotIdentifier `json:"botIdentifier"`
}

type createPayload struct {
	GameName      string               `json:"gameName"`
	BotIdentifier *model.BotIdentifier `json:"botIdentifier"`
}

func withMessageArgument[T any](
	messageData map[string]json.RawMessage,
	key string,
	handle func(T) error,
) error {
	value, err := getMessageArgument[T](messageData, key)
	if err != nil {
		return apperror.ErrorInvalidData
	}
	return handle(*value)
}

func withMessagePayload[T any](
	messageData map[string]json.RawMessage,
	handle func(T) error,
) error {
	encoded, err := json.Marshal(messageData)
	if err != nil {
		return apperror.ErrorInvalidData
	}

	var payload T
	if err := json.Unmarshal(encoded, &payload); err != nil {
		return apperror.ErrorInvalidData
	}
	return handle(payload)
}

func (h *Handler) handleWithoutErrorSend(messageType string, messageData map[string]json.RawMessage) error {
	switch messageType {
	case "SubscribeLobby":
		return h.handleSubscribeLobby()
	case "SubscribeConfigRoom":
		return withMessagePayload(messageData, func(payload subscribeConfigRoomPayload) error {
			if payload.GameID == 0 {
				return apperror.ErrorInvalidData
			}
			return h.handleSubscribeConfigRoom(payload.GameID, payload.BotIdentifier)
		})
	case "SubscribeGame":
		return withMessageArgument(messageData, "gameId", h.handleSubscribeGame)
	case "Unsubscribe":
		return h.unsubscribe()
	case "ChatSend":
		return withMessageArgument(messageData, "message", h.handleChatSend)
	case "Create":
		return withMessagePayload(messageData, func(payload createPayload) error {
			return h.handleCreateGame(payload.GameName, payload.BotIdentifier)
		})
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
