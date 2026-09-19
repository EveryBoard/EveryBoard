package protocol

import (
	"encoding/json"
	"fmt"
)

func DecodeIncomingMessage(message []byte) (string, map[string]json.RawMessage, error) {
	var array []json.RawMessage
	err := json.Unmarshal(message, &array)
	if err != nil {
		return "", nil, err
	}
	if len(array) >= 1 {
		var messageType string
		err := json.Unmarshal(array[0], &messageType)
		if err != nil {
			return "", nil, err
		}

		var messagePayload map[string]json.RawMessage = nil
		if len(array) == 2 {
			err := json.Unmarshal(array[1], &messagePayload)
			if err != nil {
				return "", nil, err
			}
		}
		return messageType, messagePayload, nil
	} else {
		return "", nil, fmt.Errorf("improperly formatted message: %v", message)
	}
}
