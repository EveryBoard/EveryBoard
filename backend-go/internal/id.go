package internal

import (
	"fmt"
	"log"
	"github.com/sqids/sqids-go"
)

type GameID uint64

// Encoder for game ids, so that they are easily human readable
var idEncoder *sqids.Sqids

const GameIDLobby = 1

func InitIdEncoder() {
	var err error
	idEncoder, err = sqids.New(sqids.Options{
		MinLength: 5,
	})
	if err != nil {
		log.Fatal("Failed to initialize sqids:", err)
	}
}

func EncodeId(gameId GameID) (string, error) {
	if gameId == GameIDLobby {
		return "lobby", nil
	} else {
		id, error := idEncoder.Encode([]uint64{uint64(gameId)})
		return id, error
	}
}

func DecodeId(gameId string) (GameID, error) {
	if gameId == "lobby" {
		return GameIDLobby, nil
	} else {
		ids := idEncoder.Decode(gameId)
		if len(ids) != 1 {
			return 0, fmt.Errorf("Invalid id: %v", gameId)
		}
		return GameID(ids[0]), nil
	}
}
