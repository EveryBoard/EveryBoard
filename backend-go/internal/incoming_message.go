package internal

import (
	"encoding/json"
	"fmt"
	"log"
)

func DecodeIncomingMessage(message []byte) (string, map[string]interface{}, error) {
	log.Printf("Decoding [%v]", string(message))
	var array []json.RawMessage
	err := json.Unmarshal(message, &array);
	if err != nil {
		return "", nil, err
	}
	if len(array) >= 1 {
		var messageType string
		err := json.Unmarshal(array[0], &messageType)
		if err != nil {
			return "", nil, err
		}

		var messagePayload map[string]interface{} = nil
		if len(array) == 2 {
			err := json.Unmarshal(array[1], &messagePayload)
			if err != nil {
				return "", nil, err
			}
		}
		return messageType, messagePayload, nil
	} else {
		return "", nil, fmt.Errorf("Improperly formatted message: %v", message)
	}
}

type SubscribeConfigRoom struct {
	GameID string `json:"gameId"`
}

type SubscribeGame struct {
	GameID string `json:"gameId"`
}

type SubscribeLobby struct {}

type Unsubscribe struct {}

type ChatSend struct {
	Message string `json:"message"`
}

type Create struct {
	GameName string `json:"gameName"`
}
