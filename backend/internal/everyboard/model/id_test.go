package model

import (
	"testing"
)

func TestEncodeAndDecodeIdWithSqids(t *testing.T) {
	// Given the default sqids encoder and a gameId
	const gameId GameID = 42

	// When encoding the id and decoding it
	encoded, err := EncodeID(gameId)
	if err != nil {
		t.Fatalf("cannot encode: %v", err)
	}
	decoded, err := DecodeID(encoded)
	if err != nil {
		t.Fatalf("cannot decode: %v", err)
	}

	// Then we should retrieve the same id
	if decoded != gameId {
		t.Fatalf("got different decoded id, got %d instead of %d", decoded, gameId)
	}
}

func TestEncodeAndDecodeLobbyIdWithSqids(t *testing.T) {
	// Given the default sqids encoder

	// When encoding and decoding the lobby id
	encoded, err := EncodeID(GameIDLobby)
	if err != nil {
		t.Fatalf("cannot encode: %v", err)
	}
	decoded, err := DecodeID(encoded)
	if err != nil {
		t.Fatalf("cannot decode: %v", err)
	}

	// Then we should retrieve the same id
	if decoded != GameIDLobby {
		t.Fatalf("got different decoded id, got %d instead of %d", decoded, GameIDLobby)
	}
}

func TestDecodeInvalidIdWithSqids(t *testing.T) {
	// Given the default sqids encoder

	// When trying to decode an invalid id (one that would decode to multiple uint64 for example, here to [42, 43])
	decoded, err := DecodeID("5cQlZ")

	// Then it should fail
	if err == nil {
		t.Fatalf("expected to fail but did not, decoded id as %v", decoded)
	}
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
	if err != nil {
		t.Fatalf("cannot initialize encoder: %v", err)
	}

	// When encoding an id directly with it
	encoded, err := encoder.EncodeID(42)
	if err != nil {
		t.Fatalf("cannot encode: %v", err)
	}

	// Then it should use the same wire format as the default encoder
	if encoded != "JgaEB" {
		t.Fatalf("unexpected encoded id: %s", encoded)
	}
}
