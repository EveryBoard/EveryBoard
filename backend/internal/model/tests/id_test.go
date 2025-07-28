package model

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

func TestEncodeAndDecodeId(t *testing.T) {
	// Given a gameId
	const gameId model.GameID = 42

	// When encoding the id and decoding it
	encoded, err := model.EncodeId(gameId)
	if err != nil {
		t.Fatalf("cannot encode: %v", err)
	}
	decoded, err := model.DecodeId(encoded)
	if err != nil {
		t.Fatalf("cannot decode: %v", err)
	}

	// Then we should retrieve the same id
	if decoded != gameId {
		t.Fatalf("got different decoded id, got %d instead of %d", decoded, gameId)
	}
}

func TestEncodeAndDecodeLobbyId(t *testing.T) {
	// When encoding and decoding the lobby id
	encoded, err := model.EncodeId(model.GameIDLobby)
	if err != nil {
		t.Fatalf("cannot encode: %v", err)
	}
	decoded, err := model.DecodeId(encoded)
	if err != nil {
		t.Fatalf("cannot decode: %v", err)
	}

	// Then we should retrieve the same id
	if decoded != model.GameIDLobby {
		t.Fatalf("got different decoded id, got %d instead of %d", decoded, model.GameIDLobby)
	}
}

func TestDecodeInvalidId(t *testing.T) {
	// When trying to decode an invalid id (one that would decode to multiple uint64 for example, here to [42, 43])
	decoded, err := model.DecodeId("5cQlZ")
	if err == nil {
		t.Fatalf("expected to fail but did not, decoded id as %v", decoded)
	}
}

func TestMarshalId(t *testing.T) {
	const gameId model.GameID = 42
	ExpectMarshallingToWorkBothWays(t, gameId, `"JgaEB"`)
}
