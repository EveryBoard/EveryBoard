package internal

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

const (
	AlreadySubscribed = "already-subscribed"
	UnknownMessage    = "unknown-message"
	GameDoesNotExist  = "game-does-not-exist"
)

type ErrorMessage struct {
	Reason string `json:"reason"`
}

type ChatMessage struct {
	Message Message `json:"message"`
}

type GameCreatedMessage struct {
	GameId string `json:"gameId"`
}

type ConfigRoomUpdate struct {
	GameId string `json:"gameId"`
	ConfigRoom ConfigRoom `json:"configRoom"`
}

func SendMessage(connection *websocket.Conn, messageType string, messageData interface{}) {
	toSend, err := json.Marshal([2]interface{}{messageType, messageData})
	if err != nil {
		log.Printf("Error when sending a message: %v", err)
		return
	}

	log.Printf(">>> %v %v", string(toSend))
	connection.WriteMessage(websocket.TextMessage, toSend)
}

func SendError(connection *websocket.Conn, reason string) {
	SendMessage(connection, "Error", ErrorMessage{reason})
}
