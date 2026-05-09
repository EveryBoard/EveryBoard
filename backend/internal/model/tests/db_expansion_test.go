package model

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/model"
	"gorm.io/driver/sqlite"
)

func TestUpdateElosSuccess(t *testing.T) {
	store, _ := model.InitDatabase(sqlite.Open(":memory:"))
	winner := model.MinimalUser{ID: "w", Name: "winner"}
	loser := model.MinimalUser{ID: "l", Name: "loser"}
	
	// Initialize Elos
	_, _, _ = store.GetElos("test", winner, loser)

	// Update should now work
	err := store.UpdateElos("test", winner, model.Elo{UserID: "w", GameName: "test", CurrentElo: 100}, loser, model.Elo{UserID: "l", GameName: "test", CurrentElo: 50})
	if err != nil {
		t.Fatalf("UpdateElos failed: %v", err)
	}
	
	// GetElos should retrieve them
	ew, el, err := store.GetElos("test", winner, loser)
	if err != nil {
		t.Fatalf("GetElos failed: %v", err)
	}
	if ew.CurrentElo != 100 || el.CurrentElo != 50 {
		t.Errorf("expected 100 and 50, got %f and %f", ew.CurrentElo, el.CurrentElo)
	}
}

func TestGetElosMissingUser(t *testing.T) {
	store, _ := model.InitDatabase(sqlite.Open(":memory:"))
	u1 := model.MinimalUser{ID: "u1", Name: "u1"}
	u2 := model.MinimalUser{ID: "u2", Name: "u2"}
	
	// Should work even if users don't exist (returns 0.0 elo)
	ew, el, err := store.GetElos("test", u1, u2)
	if err != nil {
		t.Fatalf("GetElos failed for missing users: %v", err)
	}
	if ew.CurrentElo != 0.0 || el.CurrentElo != 0.0 {
		t.Errorf("expected 0.0 elos, got %f and %f", ew.CurrentElo, el.CurrentElo)
	}
}
