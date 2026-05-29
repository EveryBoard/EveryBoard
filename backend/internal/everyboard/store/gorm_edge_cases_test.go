package store

import (
	"fmt"
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
	if err == nil {
		t.Fatal("expected error for failing dialector")
	}
}

func TestGetEloDoesNotExist(t *testing.T) {
	store, _ := InitDatabase(sqlite.Open(":memory:"))
	user := model.MinimalUser{ID: "non-existent", Name: "non-existent"}
	elo, err := store.GetElo("some-game", user)
	if err != nil {
		t.Fatalf("did not expect error for non-existent elo: %v", err)
	}
	if elo.CurrentElo != 0.0 {
		t.Errorf("expected 0.0 elo, got %f", elo.CurrentElo)
	}
}

func TestUpdateElosTransaction(t *testing.T) {
	store, _ := InitDatabase(sqlite.Open(":memory:"))

	// Transaction that returns an error
	err := store.Transaction(func(s Store) error {
		return fmt.Errorf("forced transaction failure")
	})
	if err == nil {
		t.Fatal("expected error from transaction")
	}
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
		if err == nil {
			t.Error("expected error")
		}
	})

	t.Run("CreateGameError", func(t *testing.T) {
		_, err := store.CreateGame(&model.ConfigRoom{}, 0, false)
		if err == nil {
			t.Error("expected error")
		}
	})

	t.Run("AddEventError", func(t *testing.T) {
		err := store.AddEvent(1, &model.GameEvent{})
		if err == nil {
			t.Error("expected error")
		}
	})

	t.Run("SetGameResultError", func(t *testing.T) {
		err := store.SetGameResult(&model.Game{}, model.ResultVictoryOfZero)
		if err == nil {
			t.Error("expected error")
		}
	})

	t.Run("SetCurrentGameError", func(t *testing.T) {
		err := store.SetCurrentGame(&model.CurrentGame{})
		if err == nil {
			t.Error("expected error")
		}
	})

	t.Run("UpdateElosError", func(t *testing.T) {
		err := store.UpdateElos("test", user, model.Elo{}, user, model.Elo{})
		if err == nil {
			t.Error("expected error")
		}
	})

	t.Run("GetElosError", func(t *testing.T) {
		_, _, err := store.GetElos("test", user, user)
		if err == nil {
			t.Error("expected error")
		}
	})
}
