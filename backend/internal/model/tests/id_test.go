package model

import (
	"fmt"
	"strconv"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

func InitializeSqidsEncoder(t *testing.T) {
	model.SetIDEncoder(&model.SqidsEncoder{})
	err := model.InitEncoder()
	if err != nil {
		t.Fatalf("cannot initialize encoder: %v", err)
	}
}

func TestEncodeAndDecodeIdWithSqids(t *testing.T) {
	// Given a sqids encoder and a gameId
	InitializeSqidsEncoder(t)
	const gameId model.GameID = 42

	// When encoding the id and decoding it
	encoded, err := model.EncodeID(gameId)
	if err != nil {
		t.Fatalf("cannot encode: %v", err)
	}
	decoded, err := model.DecodeID(encoded)
	if err != nil {
		t.Fatalf("cannot decode: %v", err)
	}

	// Then we should retrieve the same id
	if decoded != gameId {
		t.Fatalf("got different decoded id, got %d instead of %d", decoded, gameId)
	}
}

func TestEncodeAndDecodeLobbyIdWithSqids(t *testing.T) {
	// Given a sqids encoder
	InitializeSqidsEncoder(t)

	// When encoding and decoding the lobby id
	encoded, err := model.EncodeID(model.GameIDLobby)
	if err != nil {
		t.Fatalf("cannot encode: %v", err)
	}
	decoded, err := model.DecodeID(encoded)
	if err != nil {
		t.Fatalf("cannot decode: %v", err)
	}

	// Then we should retrieve the same id
	if decoded != model.GameIDLobby {
		t.Fatalf("got different decoded id, got %d instead of %d", decoded, model.GameIDLobby)
	}
}

func TestDecodeInvalidIdWithSqids(t *testing.T) {
	// Given a sqids encoder
	InitializeSqidsEncoder(t)

	// When trying to decode an invalid id (one that would decode to multiple uint64 for example, here to [42, 43])
	decoded, err := model.DecodeID("5cQlZ")
	if err == nil {
		t.Fatalf("expected to fail but did not, decoded id as %v", decoded)
	}
}

func TestMarshalIdWithSqids(t *testing.T) {
	// Given a sqids encoder
	InitializeSqidsEncoder(t)
	// Then marshalling should work as expected
	const gameId model.GameID = 42
	ExpectMarshallingToWorkBothWays(t, gameId, `"JgaEB"`)
}

func TestMarshalInvalidIdWithSqids(t *testing.T) {
	// Given a sqids encoder
	InitializeSqidsEncoder(t)
	// Then unmarshalling an invalid id fails
	var gameId model.GameID
	ExpectUnmarshallingToFail(t, gameId, `{}`)  // id is not a string
	ExpectUnmarshallingToFail(t, gameId, `"x"`) // id is too short
}

type MockEncoder struct {
	errorOnInitialization bool
	errorOnEncode         bool
	errorOnDecode         bool
}

func (encoder MockEncoder) Initialize() error {
	if encoder.errorOnInitialization {
		return fmt.Errorf("encoder initialization error")
	}
	return nil
}

func (encoder MockEncoder) EncodeID(gameId model.GameID) (string, error) {
	if encoder.errorOnEncode {
		return "", fmt.Errorf("encoder encoding error")
	}
	return fmt.Sprintf("%d", gameId), nil
}

func (encoder MockEncoder) DecodeID(s string) (model.GameID, error) {
	if encoder.errorOnDecode {
		return 0, fmt.Errorf("encoder decoding error")
	}
	id, err := strconv.ParseUint(s, 10, 64)
	return model.GameID(id), err
}

func TestEncoderInitiliazationFailIsPropagated(t *testing.T) {
	// Given an encoder that will fail at initialization
	model.SetIDEncoder(&MockEncoder{
		errorOnInitialization: true,
		errorOnEncode:         false,
		errorOnDecode:         false,
	})
	// Restore the sqids encoder when done
	defer InitializeSqidsEncoder(t)

	// When initializing it
	err := model.InitEncoder()
	// Then it should fail
	if err == nil {
		t.Fatalf("failure in encoder initialization should propagate")
	}

}

func TestEncoderEncodeFailureIsPropagated(t *testing.T) {
	// Given an encoder that will fail during encoding
	model.SetIDEncoder(&MockEncoder{
		errorOnInitialization: false,
		errorOnEncode:         true,
		errorOnDecode:         false,
	})
	// Restore the sqids encoder when done
	defer InitializeSqidsEncoder(t)

	err := model.InitEncoder()
	if err != nil {
		t.Fatalf("encoder should be properly initialized")
	}
	// When encoding
	_, err = model.EncodeID(42)

	// Then it should fail
	if err == nil {
		t.Fatalf("broken encoder should propagate the failure")
	}
}

func TestEncoderDecodeFailureIsPropagated(t *testing.T) {
	// Given an encoder that will fail
	model.SetIDEncoder(&MockEncoder{
		errorOnInitialization: false,
		errorOnEncode:         false,
		errorOnDecode:         true,
	})
	// Restore the sqids encoder when done
	defer InitializeSqidsEncoder(t)

	err := model.InitEncoder()
	if err != nil {
		t.Fatalf("encoder should be properly initialized")
	}

	// When decoding
	_, err = model.DecodeID("42")

	// Then it should fail
	if err == nil {
		t.Fatalf("broken decoder should propagate the failure")
	}

}

func TestEncoderMarshalingFailureToBePropagated(t *testing.T) {
	// Given an encoder that will fail
	model.SetIDEncoder(&MockEncoder{
		errorOnInitialization: false,
		errorOnEncode:         true,
		errorOnDecode:         false,
	})
	// Restore the sqids encoder when done
	defer InitializeSqidsEncoder(t)

	err := model.InitEncoder()
	if err != nil {
		t.Fatalf("encoder should be properly initialized")
	}

	// When marshalling, then it should fail
	const gameId model.GameID = 42
	ExpectMarshallingToFail(t, gameId)

}
