package protocol

import (
	"encoding/json"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
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
	tag, arguments, err := DecodeIncomingMessage(message)
	require.NoError(t, err, "failed to decode message")

	// Then it should have extracted the tag, and have no argument
	assert.Equal(t, "Resign", tag, "invalid tag")
	assert.Nil(t, arguments, "invalid arguments")
}

func TestDecodeIncomingMessageWithParameters(t *testing.T) {
	// Given an incoming message with an argument
	message := []byte(`["SelectOpponent", {"opponent": {"id":"foo", "name":"bar"}}]`)

	// When decoding it
	tag, arguments, err := DecodeIncomingMessage(message)
	require.NoError(t, err, "failed to decode message")

	// Then it should have the expected tag and arguments
	assert.Equal(t, "SelectOpponent", tag, "invalid tag")
	expectedOpponent := `{"id": "foo", "name": "bar"}`
	assert.JSONEq(t, expectedOpponent, string(arguments["opponent"]), "invalid arguments")
}

func ExpectDecodeInvalidIncomingMessage(t *testing.T, message []byte) {
	t.Helper()
	// Given an invalid message

	// When decoding it
	_, _, err := DecodeIncomingMessage(message)

	// Then it should fail
	assert.Error(t, err, "expected invalid incoming message to fail decoding")
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
