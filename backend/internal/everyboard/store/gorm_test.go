package store

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"gorm.io/driver/sqlite"
)

func TestInitializeDB(t *testing.T) {
	// When initializing the DB
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}

	// We should have a config room for the lobby
	lobby, err := store.GetConfigRoom(model.GameIDLobby)
	if err != nil {
		t.Errorf("error when accessing lobby: %v", err)
	}
	if lobby == nil || lobby.ID != model.GameIDLobby || lobby.GameName != "lobby" {
		t.Errorf("lobby doesn't exist upon db initialization")
	}
}
