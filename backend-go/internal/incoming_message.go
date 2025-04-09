package internal

import (
	"encoding/json"
	"fmt"
)

func DecodeIncomingMessage(message []byte) (string, string, error) {
	var array []string
	err := json.Unmarshal(message, &array);
	if err != nil {
		return "", "", err
	}
	if len(array) == 1 {
		return array[0], "", nil
	} else if len(array) == 2 {
		return array[0], array[1], nil
	} else {
		return "", "", fmt.Errorf("Improperly formatted message: %v", message)
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
