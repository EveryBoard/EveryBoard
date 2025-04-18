package internal

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

type OutgoingMessage interface {
	MarshalJSON() ([]byte, error)
	Tag() string
}

type Error string

const (
	// TODO: use ErrorMessage
	ErrorAlreadySubscribed Error = "already-subscribed"
	ErrorUnknownMessage    Error = "unknown-message"
	ErrorGameDoesNotExist  Error = "game-does-not-exist"
)

type ErrorMessage struct {
	Reason Error `json:"reason"`
}

func (m ErrorMessage) MarshalJSON() ([]byte, error) {
	return json.Marshal([]any{m.Tag(), m})
}

func (m ErrorMessage) Tag() string {
	return "Error"
}

type ChatMessage struct {
	Message Message `json:"message"`
}

func (m ChatMessage) MarshalJSON() ([]byte, error) {
	return json.Marshal([]any{m.Tag(), m})
}

func (m ChatMessage) Tag() string {
	return "ChatMessage"
}

type GameCreatedMessage struct {
	GameId string `json:"gameId"`
}

func (m GameCreatedMessage) MarshalJSON() ([]byte, error) {
	return json.Marshal([]any{m.Tag(), m})
}

func (m GameCreatedMessage) Tag() string {
	return "GameCreated"
}

type ConfigRoomUpdateMessage struct {
	GameId string `json:"gameId"`
	ConfigRoom ConfigRoom `json:"configRoom"`
}

func (m ConfigRoomUpdateMessage) MarshalJSON() ([]byte, error) {
	return json.Marshal([]any{m.Tag(), m})
}

func (m ConfigRoomUpdateMessage) Tag() string {
	return "ConfigRoomUpdate"
}

func SendMessage[T OutgoingMessage](connection *websocket.Conn, msg T) error {
	toSend, err := msg.MarshalJSON()
	if err != nil {
		return err
	}

	log.Printf(">>> %v %v", string(toSend))
	return connection.WriteMessage(websocket.TextMessage, toSend)
}

func SendError(connection *websocket.Conn, reason Error) error {
	return SendMessage(connection, ErrorMessage{ Reason: reason })
}
