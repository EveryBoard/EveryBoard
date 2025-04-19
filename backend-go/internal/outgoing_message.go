package internal

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

type OutgoingMessage interface {
	Tag() string
}

type Error string

const (
	ErrorInternal          Error = "internal-error"
	ErrorInvalidData       Error = "invalid-data"
	ErrorAlreadySubscribed Error = "already-subscribed"
	ErrorNotSubscribed     Error = "not-subscribed"
	ErrorUnknownMessage    Error = "unknown-message"
	ErrorUnknownGame       Error = "unknown-game"
	ErrorGameDoesNotExist  Error = "game-does-not-exist"
)

type ErrorMessage struct {
	Reason Error `json:"reason"`
}

func (m ErrorMessage) Tag() string {
	return "Error"
}

type ChatMessage struct {
	Message Message `json:"message"`
}

func (m ChatMessage) Tag() string {
	return "ChatMessage"
}

type GameCreatedMessage struct {
	GameId GameID `json:"gameId"`
}

func (m GameCreatedMessage) Tag() string {
	return "GameCreated"
}

type ConfigRoomUpdateMessage struct {
	GameID     GameID     `json:"gameId"`
	ConfigRoom ConfigRoom `json:"configRoom"`
}

func (m ConfigRoomUpdateMessage) Tag() string {
	return "ConfigRoomUpdate"
}

type ConfigRoomDeletedMessage struct {
	GameID GameID `json:"gameId"`
}

func (m ConfigRoomDeletedMessage) Tag() string {
	return "ConfigRoomDeleted"
}

type CandidateJoinedMessage struct {
	Candidate MinimalUser `json:"candidate"`
}

func (m CandidateJoinedMessage) Tag() string {
	return "CandidateJoined"
}

type CandidateLeftMessage struct {
	Candidate MinimalUser `json:"candidate"`
}

func (m CandidateLeftMessage) Tag() string {
	return "CandidateLeft"
}

func SendMessage(connection *websocket.Conn, msg OutgoingMessage) error {
	toSend, err := json.Marshal([]any{msg.Tag(), msg})
	if err != nil {
		return err
	}

	log.Printf(">>> %v", string(toSend))
	return connection.WriteMessage(websocket.TextMessage, toSend)
}

func SendError(connection *websocket.Conn, reason Error) error {
	return SendMessage(connection, ErrorMessage{Reason: reason})
}
