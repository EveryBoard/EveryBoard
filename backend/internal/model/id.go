package model

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/sqids/sqids-go"
)

type GameID uint64

 // The lobby is the first game id that exist. It needs a game id for ensuring
 // that we can send messages to it and subscribe to it.
const GameIDLobby GameID = 1

type IDEncoder interface {
	Initialize() error
	EncodeID(GameID) (string, error)
	DecodeID(string) (GameID, error)
}

type SqidsEncoder struct {
	encoder *sqids.Sqids
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
var idEncoder IDEncoder

// Change the encoder, for testing purposes
func SetIDEncoder(encoder IDEncoder) {
	idEncoder = encoder
}
// Initializes the encoder for ids
func InitializeEncoder() error {
	return idEncoder.Initialize()
}

func EncodeID(gameId GameID) (string, error) {
	if gameId == GameIDLobby {
		return "lobby", nil
	}
	id, err := idEncoder.EncodeID(gameId)
	return id, err
}

func DecodeID(gameId string) (GameID, error) {
	if gameId == "lobby" {
		return GameIDLobby, nil
	}

	id, error := idEncoder.DecodeID(gameId)
	return GameID(id), error
}

func (id GameID) MarshalJSON() ([]byte, error) {
	stringId, err := EncodeID(id)
	log.Printf("string, err: %s, %v", stringId, err)
	if err != nil {
		log.Printf("err is not nil!")
		return nil, err
	}
	return json.Marshal(stringId)
}

func (id *GameID) UnmarshalJSON(data []byte) error {
	var s string
	log.Printf("unmarshalling %v", data)
	err := json.Unmarshal(data, &s)
	log.Printf("unmarshalled json is %s and error is %s", s, err)
	if err != nil {
		return err
	}
	*id, err = DecodeID(s)
	log.Printf("id is %d and error is %s", *id, err)
	if err != nil {
		return err
	}
	return nil
}
