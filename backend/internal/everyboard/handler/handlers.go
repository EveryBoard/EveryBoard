package handler

import (
	"encoding/json"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/logger"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
)

func (h *Handler) handleWithoutErrorSend(messageType string, messageData map[string]json.RawMessage) error {
	switch messageType {
	case "SubscribeLobby":
		return h.handleSubscribeLobby()
	case "SubscribeConfigRoom":
		gameId, err := getMessageArgument[model.GameID](messageData, "gameId")
		if err != nil {
			return apperror.ErrorInvalidData
		}
		return h.handleSubscribeConfigRoom(*gameId)
	case "SubscribeGame":
		gameId, err := getMessageArgument[model.GameID](messageData, "gameId")
		if err != nil {
			return apperror.ErrorInvalidData
		}
		return h.handleSubscribeGame(*gameId)
	case "Unsubscribe":
		return h.unsubscribe()
	case "ChatSend":
		content, err := getMessageArgument[string](messageData, "message")
		if err != nil {
			return apperror.ErrorInvalidData
		}
		return h.handleChatSend(*content)
	case "Create":
		gameName, err := getMessageArgument[string](messageData, "gameName")
		if err != nil {
			return apperror.ErrorInvalidData
		}
		return h.handleCreateGame(*gameName)
	case "SelectOpponent":
		opponent, err := getMessageArgument[model.MinimalUser](messageData, "opponent")
		if err != nil {
			return apperror.ErrorInvalidData
		}
		return h.handleSelectOpponent(*opponent)
	case "ProposeConfig":
		config, err := getMessageArgument[model.ConfigProposal](messageData, "config")
		if err != nil {
			return apperror.ErrorInvalidData
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
			return apperror.ErrorInvalidData
		}
		return h.handleNotifyTimeout(*timeoutedPlayer)
	case "EndGame":
		winner, err := getMessageArgument[model.PlayerOrNone](messageData, "winner")
		if err != nil {
			return apperror.ErrorInvalidData
		}
		return h.handleGameEnd(*winner)
	case "Propose":
		proposition, err := getMessageArgument[model.Proposition](messageData, "proposition")
		if err != nil {
			return apperror.ErrorInvalidData
		}
		return h.handlePropose(*proposition)
	case "Reject":
		proposition, err := getMessageArgument[model.Proposition](messageData, "proposition")
		if err != nil {
			return apperror.ErrorInvalidData
		}
		return h.handleReject(*proposition)
	case "Accept":
		proposition, err := getMessageArgument[model.Proposition](messageData, "proposition")
		if err != nil {
			return apperror.ErrorInvalidData
		}
		return h.handleAccept(*proposition)
	case "AddTime":
		kind, err := getMessageArgument[model.AddTimeKind](messageData, "kind")
		if err != nil {
			return apperror.ErrorInvalidData
		}
		return h.handleAddTime(*kind)
	case "Move":
		move, err := getMessageArgument[json.RawMessage](messageData, "move")
		if err != nil {
			return apperror.ErrorInvalidData
		}
		return h.handleMove(*move)
	default:
		return apperror.ErrorUnknownMessage
	}
}

func (h *Handler) handle(messageType string, messageData map[string]json.RawMessage) error {
	err := RecoverMiddleware(h.user.Name, func() error {
		return h.handleWithoutErrorSend(messageType, messageData)
	})

	if err == nil {
		return nil
	}
	e, ok := err.(apperror.BackendError)
	if ok {
		h.sendError(e)
		return nil
	}
	printableData, _ := json.Marshal(messageData)
	logger.Error.Printf("Error when handling %v (%s) message: %v", messageType, printableData, err)
	return err
}

func (h *Handler) Handle(messageType string, messageData map[string]json.RawMessage) error {
	return h.handle(messageType, messageData)
}

func (h *Handler) clientLeft() error {
	return h.unsubscribe()
}

func (h *Handler) ClientLeft() error {
	return h.clientLeft()
}
