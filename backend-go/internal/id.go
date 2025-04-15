package internal

import (
	"fmt"
	"log"
	"github.com/sqids/sqids-go"
)

// Encoder for game ids, so that they are easily human readable
var idEncoder *sqids.Sqids

const IdLobby = 0

func InitIdEncoder() {
	var err error
	idEncoder, err = sqids.New(sqids.Options{
		MinLength: 5,
	})
	if err != nil {
		log.Fatal("Failed to initialize sqids:", err)
	}
}

func EncodeId(gameId uint64) (string, error) {
	if gameId == IdLobby {
		return "lobby", nil
	} else {
		id, error := idEncoder.Encode([]uint64{gameId})
		return id, error
	}
}

func DecodeId(gameId string) (uint64, error) {
	if gameId == "lobby" {
		return IdLobby, nil
	} else {
		ids := idEncoder.Decode(gameId)
		if len(ids) != 1 {
			return 0, fmt.Errorf("Invalid id: %v", gameId)
		}
		return ids[0], nil
	}
}
