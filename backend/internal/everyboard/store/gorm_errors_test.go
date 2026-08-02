package store

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type FailingDialector struct {
	gorm.Dialector
}

func (d FailingDialector) Initialize(db *gorm.DB) error {
	return fmt.Errorf("forced dialector failure")
}

func TestInitDatabaseFailure(t *testing.T) {
	_, err := InitDatabase(FailingDialector{})
	require.Error(t, err, "expected database initialization to fail")
}

func TestGetEloDoesNotExist(t *testing.T) {
	store, _ := InitDatabase(sqlite.Open(":memory:"))
	user := model.MinimalUser{ID: "non-existent", Name: "non-existent"}
	elo, err := store.GetElo("some-game", user)
	require.NoError(t, err, "error when getting elo")
	assert.Equal(t, 0.0, elo.CurrentElo, "expected 0.0 elo")
}

func TestUpdateElosTransaction(t *testing.T) {
	store, _ := InitDatabase(sqlite.Open(":memory:"))

	// Transaction that returns an error
	err := store.Transaction(func(s Store) error {
		return fmt.Errorf("forced transaction failure")
	})
	require.Error(t, err, "expected transaction callback error to be returned")
}

func TestGORMStoreErrorPaths(t *testing.T) {
	store, _ := InitDatabase(sqlite.Open(":memory:"))
	// Close the underlying DB to force errors
	db := store.DB()
	sqlDB, _ := db.DB()
	sqlDB.Close()

	user := model.MinimalUser{ID: "u", Name: "u"}

	t.Run("GetEloError", func(t *testing.T) {
		_, err := store.GetElo("test", user)
		assert.Error(t, err, "expected GetElo to fail after closing database")
	})

	t.Run("CreateGameError", func(t *testing.T) {
		_, err := store.CreateGame(&model.ConfigRoom{}, 0, false)
		assert.Error(t, err, "expected CreateGame to fail after closing database")
	})

	t.Run("AddEventError", func(t *testing.T) {
		err := store.AddEvent(1, &model.GameEvent{})
		assert.Error(t, err, "expected AddEvent to fail after closing database")
	})

	t.Run("SetGameResultError", func(t *testing.T) {
		err := store.SetGameResult(&model.Game{}, model.ResultVictoryOfZero)
		assert.Error(t, err, "expected SetGameResult to fail after closing database")
	})

	t.Run("SetCurrentGameError", func(t *testing.T) {
		err := store.SetCurrentGame(&model.CurrentGame{})
		assert.Error(t, err, "expected SetCurrentGame to fail after closing database")
	})

	t.Run("UpdateElosError", func(t *testing.T) {
		err := store.UpdateElos("test", user, model.Elo{}, user, model.Elo{})
		assert.Error(t, err, "expected UpdateElos to fail after closing database")
	})

	t.Run("GetElosError", func(t *testing.T) {
		_, _, err := store.GetElos("test", user, user)
		assert.Error(t, err, "expected GetElos to fail after closing database")
	})
}
