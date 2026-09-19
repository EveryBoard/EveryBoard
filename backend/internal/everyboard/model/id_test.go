package model

import (
	"github.com/stretchr/testify/require"
	"testing"
)

func TestEncodeAndDecodeIdWithSqids(t *testing.T) {
	// Given the default sqids encoder and a gameId
	const gameId GameID = 42

	// When encoding the id and decoding it
	encoded, err := EncodeID(gameId)
	require.NoError(t, err, "cannot encode id")
	decoded, err := DecodeID(encoded)
	require.NoError(t, err, "cannot decode id")

	// Then we should retrieve the same id
	require.Equal(t, gameId, decoded, "got different decoded id")
}

func TestEncodeAndDecodeLobbyIdWithSqids(t *testing.T) {
	// Given the default sqids encoder

	// When encoding and decoding the lobby id
	encoded, err := EncodeID(GameIDLobby)
	require.NoError(t, err, "cannot encode id")
	decoded, err := DecodeID(encoded)
	require.NoError(t, err, "cannot decode id")

	// Then we should retrieve the same id
	require.Equal(t, GameIDLobby, decoded, "got different decoded id")
}

func TestDecodeInvalidIdWithSqids(t *testing.T) {
	// Given the default sqids encoder

	// When trying to decode an invalid id (one that would decode to multiple uint64 for example, here to [42, 43])
	_, err := DecodeID("5cQlZ")

	// Then it should fail
	require.Error(t, err, "expected invalid id to fail decoding")
}

func TestMarshalIdWithSqids(t *testing.T) {
	// Given the default sqids encoder
	const gameId GameID = 42

	// Then marshalling should work as expected
	ExpectMarshallingToWorkBothWays(t, gameId, `"JgaEB"`)
}

func TestMarshalInvalidIdWithSqids(t *testing.T) {
	// Given the default sqids encoder
	var gameId GameID

	// Then unmarshalling invalid ids fails
	ExpectUnmarshallingToFail(t, gameId, `{}`)  // id is not a string
	ExpectUnmarshallingToFail(t, gameId, `"x"`) // id is too short
}

func TestNewSqidsEncoder(t *testing.T) {
	// Given a standalone sqids encoder
	encoder, err := NewSqidsEncoder()
	require.NoError(t, err, "cannot create sqids encoder")

	// When encoding an id directly with it
	encoded, err := encoder.EncodeID(42)
	require.NoError(t, err, "cannot encode id")

	// Then it should use the same wire format as the default encoder
	require.Equal(t, "JgaEB", encoded, "unexpected encoded id")
}
