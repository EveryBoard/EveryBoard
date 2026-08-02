package model

import (
	"testing"
)

func TestMarshalMessage(t *testing.T) {
	original := Message{
		GameID:    0, // GameID is not part of the marshalling
		Sender:    MinimalUser{ID: "foo", Name: "alice"},
		Timestamp: 1000,
		Content:   "Hello world",
	}
	json := `{"sender":{"id":"foo","name":"alice"},"timestamp":1000,"content":"Hello world"}`
	ExpectMarshallingToWork(t, original, json)
}
