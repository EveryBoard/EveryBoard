package model

import (
	"encoding/json"
	"fmt"

	"github.com/sqids/sqids-go"
)

type GameID uint64

// The lobby is the first game id that exist. It needs a game id for ensuring
// that we can send messages to it and subscribe to it.
const GameIDLobby GameID = 1

type SqidsEncoder struct {
	encoder *sqids.Sqids
}

func NewSqidsEncoder() (*SqidsEncoder, error) {
	encoder := &SqidsEncoder{}
	if err := encoder.Initialize(); err != nil {
		return nil, err
	}
	return encoder, nil
}

func (idEncoder *SqidsEncoder) Initialize() error {
	encoder, err := sqids.New(sqids.Options{
		MinLength: 5, // Chosen arbitrarily, because shorter than 5 seems a bit too short
	})
	idEncoder.encoder = encoder
	return err
}

func (idEncoder SqidsEncoder) EncodeID(gameId GameID) (string, error) {
	return idEncoder.encoder.Encode([]uint64{uint64(gameId)})
}

func (idEncoder SqidsEncoder) DecodeID(s string) (GameID, error) {
	ids := idEncoder.encoder.Decode(s)
	if len(ids) != 1 {
		return 0, fmt.Errorf("invalid id: %s", s)
	}
	return GameID(ids[0]), nil
}

// Encoder for game ids, so that they are easily human readable
// For example, id 42 is encoded as JgaEB
var idEncoder, idEncoderErr = NewSqidsEncoder()

func EncodeID(gameId GameID) (string, error) {
	if gameId == GameIDLobby {
		return "lobby", nil
	}
	if idEncoderErr != nil {
		return "", idEncoderErr
	}
	return idEncoder.EncodeID(gameId)
}

func DecodeID(gameId string) (GameID, error) {
	if gameId == "lobby" {
		return GameIDLobby, nil
	}

	if idEncoderErr != nil {
		return 0, idEncoderErr
	}
	return idEncoder.DecodeID(gameId)
}

func (id GameID) MarshalJSON() ([]byte, error) {
	stringId, err := EncodeID(id)
	if err != nil {
		return nil, err
	}
	return json.Marshal(stringId)
}

func (id *GameID) UnmarshalJSON(data []byte) error {
	var s string
	err := json.Unmarshal(data, &s)
	if err != nil {
		return err
	}
	*id, err = DecodeID(s)
	if err != nil {
		return err
	}
	return nil
}
