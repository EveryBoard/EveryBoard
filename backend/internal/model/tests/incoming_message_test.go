package model

import (
	"encoding/json"
	"reflect"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

func TestMarshalConfigProposal(t *testing.T) {
	// Even though config proposals are only meant to be received, we test them
	// in both ways (sending and receiving), for simplicity.
	original := model.ConfigProposal{
		GameType:     model.GameTypeBlitz,
		MoveDuration: 30,
		GameDuration: 1200,
		FirstPlayer:  model.FirstPlayerCreator,
		RulesConfig:  json.RawMessage(`{"width":42,"height":42}`),
	}
	json := `{"gameType":"Blitz","moveDuration":30,"gameDuration":1200,"firstPlayer":"Creator","rulesConfig":{"width":42,"height":42}}`
	ExpectMarshallingToWork(t, original, json)
}

func TestDecodeIncomingMessageWithoutArguments(t *testing.T) {
	// Given an incoming message without any argument
	message := []byte(`["Resign"]`)

	// When decoding it
	tag, arguments, err := model.DecodeIncomingMessage(message)
	if err != nil {
		t.Errorf("failed to decode message: %v", err)
	}

	// Then it should have extracted the tag, and have no argument
	if tag != "Resign" {
		t.Errorf("invalid tag: %s", tag)
	}
	if arguments != nil {
		t.Errorf("invalid arguments: %s", arguments)
	}
}

func TestDecodeIncomingMessageWithParameters(t *testing.T) {
	// Given an incoming message with an argument
	message := []byte(`["SelectOpponent", {"opponent": {"id":"foo", "name":"bar"}}]`)

	// When decoding it
	tag, arguments, err := model.DecodeIncomingMessage(message)
	if err != nil {
		t.Errorf("failed to decode message: %v", err)
	}

	// Then it should have the expected tag and arguments
	if tag != "SelectOpponent" {
		t.Errorf("invalid tag: %s", tag)
	}
	expectedArguments := map[string]json.RawMessage{
		"opponent": json.RawMessage(`{"id": "foo", "name": "bar"}`),
	}
	if reflect.DeepEqual(arguments, expectedArguments) {
		t.Errorf("invalid arguments: %v", arguments)
	}
}

func ExpectDecodeInvalidIncomingMessage(t *testing.T, message []byte) {
	t.Helper()
	// Given an invalid message

	// When decoding it
	tag, arguments, err := model.DecodeIncomingMessage(message)

	// Then it should fail
	if err == nil {
		t.Errorf("succesfully decoded a message that should fail: %s, %v", tag, arguments)
	}
}

func TestDecodeInvalidIncomingMessageDueToNotAnArray(t *testing.T) {
	ExpectDecodeInvalidIncomingMessage(t, []byte(`{"lol": "invalid"}`))
}

func TestDecodeInvalidIncomingMessageDueToEmptyArray(t *testing.T) {
	ExpectDecodeInvalidIncomingMessage(t, []byte(`[]`))
}

func TestDecodeInvalidIncomingMessageDueToInvalidTag(t *testing.T) {
	ExpectDecodeInvalidIncomingMessage(t, []byte(`[{"not":"aTag"}]`))
}

func TestDecodeInvalidIncomingMessageDueToInvalidArgument(t *testing.T) {
	ExpectDecodeInvalidIncomingMessage(t, []byte(`["Tag", "invalid argument"]`))
}
