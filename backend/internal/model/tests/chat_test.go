package model

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

func TestMarshalMessage(t *testing.T) {
	original := model.Message{
		GameID:    0, // GameID is not part of the marshalling
		Sender:    model.MinimalUser{ID: "foo", Name: "alice"},
		Timestamp: 1000,
		Content:   "Hello world",
	}
	json := `{"sender":{"id":"foo","name":"alice"},"timestamp":1000,"content":"Hello world"}`
	TestMarshal(t, original, json)
}
