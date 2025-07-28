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
const GameIDLobby = 1

// Encoder for game ids, so that they are easily human readable
// For example, id 42 is encoded as JgaEB
var idEncoder *sqids.Sqids = initIDEncoder()

// Initializes the encoder for ids
func initIDEncoder() *sqids.Sqids {
	var err error
	encoder, err := sqids.New(sqids.Options{
		MinLength: 5, // Chosen arbitrarily, because shorter than 5 seems a bit too short
	})
	if err != nil {
		log.Fatal("Failed to initialize sqids:", err)
	}
	return encoder
}

func EncodeId(gameId GameID) (string, error) {
	if gameId == GameIDLobby {
		return "lobby", nil
	}
	id, err := idEncoder.Encode([]uint64{uint64(gameId)})
	return id, err
}

func DecodeId(gameId string) (GameID, error) {
	if gameId == "lobby" {
		return GameIDLobby, nil
	}
	ids := idEncoder.Decode(gameId)
	if len(ids) != 1 {
		return 0, fmt.Errorf("invalid id: %v", gameId)
	}
	return GameID(ids[0]), nil
}

func (id GameID) MarshalJSON() ([]byte, error) {
	stringId, err := EncodeId(id)
	if err != nil {
		// REVIEW: this is a branch we can't ever reach. How do we deal with this? We can't achieve 100% coverage. We cannot reliably have the encoder fail. But ignoring its error will be bad in case it ever fails.
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
	*id, err = DecodeId(s)
	if err != nil {
		return err
	}
	return nil

}
