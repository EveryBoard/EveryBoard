package store

import (
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"gorm.io/driver/sqlite"
)

func TestInitializeDB(t *testing.T) {
	// When initializing the DB
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")

	// We should have a config room for the lobby
	lobby, err := store.GetConfigRoom(model.GameIDLobby)
	require.NoError(t, err, "cannot get config room")
	require.NotNil(t, lobby, "lobby doesn't exist upon db initialization")
	assert.Equal(t, model.GameIDLobby, lobby.ID, "lobby doesn't exist upon db initialization")
	assert.Equal(t, "lobby", lobby.GameName, "lobby doesn't exist upon db initialization")
}
