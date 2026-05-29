package store

import (
	"sync"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"gorm.io/driver/sqlite"
)

func TestUpdateElosSuccess(t *testing.T) {
	store, _ := InitDatabase(sqlite.Open(":memory:"))
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
	store, _ := InitDatabase(sqlite.Open(":memory:"))
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

func TestGetEloEmptyDB(t *testing.T) {
	// Given a empty db
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	// When retrieving an model.Elo which does not exists
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	gameName := "Go"
	elo, err := store.GetElo(gameName, user)
	// Then it should give an empty model.Elo
	if err != nil {
		t.Fatalf("error when getting elo: %v", err)
	}
	if elo == nil || elo.UserID != user.ID || elo.GameName != gameName {
		t.Fatalf("invalid elo returned: %v", elo)
	}
}

func TestGetEloConcurrentFirstCreate(t *testing.T) {
	// Given a db with no model.Elo for a user yet
	store, err := InitDatabase(sqlite.Open("file:elo_concurrency?mode=memory&cache=shared&_busy_timeout=5000"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	gameName := "Go"

	// When several goroutines create the same model.Elo concurrently
	const numGoroutines = 50
	var wg sync.WaitGroup
	wg.Add(numGoroutines)
	errs := make(chan error, numGoroutines)
	start := make(chan struct{})
	for i := 0; i < numGoroutines; i++ {
		go func() {
			defer wg.Done()
			<-start
			_, err := store.GetElo(gameName, user)
			errs <- err
		}()
	}
	close(start)
	wg.Wait()
	close(errs)

	// Then every caller should succeed and exactly one row should exist
	for err := range errs {
		if err != nil {
			t.Fatalf("concurrent GetElo failed: %v", err)
		}
	}
	var count int64
	if err := store.DB().Model(&model.Elo{}).
		Where("user_id = ? AND game_name = ?", user.ID, gameName).
		Count(&count).Error; err != nil {
		t.Fatalf("cannot count model.Elo rows: %v", err)
	}
	if count != 1 {
		t.Fatalf("expected exactly one model.Elo row, got %d", count)
	}
}

func TestUpdateElos(t *testing.T) {
	// Given a db with some model.Elo
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	winner := model.MinimalUser{ID: "foo", Name: "foo"}
	loser := model.MinimalUser{ID: "bar", Name: "bar"}

	// Accessing the elos ensure that they are initialized (to 0)
	gameName := "Go"
	_, err = store.GetElo(gameName, winner)
	if err != nil {
		t.Fatalf("error when getting elo: %v", err)
	}
	_, err = store.GetElo(gameName, loser)
	if err != nil {
		t.Fatalf("error when getting elo: %v", err)
	}

	// When updating the elos
	err = store.UpdateElos(gameName,
		winner, model.Elo{
			UserID:      winner.ID,
			UserName:    winner.Name,
			GameName:    gameName,
			CurrentElo:  20.0,
			GamesPlayed: 1,
		},
		loser, model.Elo{
			UserID:      loser.ID,
			UserName:    loser.Name,
			GameName:    gameName,
			CurrentElo:  1.0,
			GamesPlayed: 1,
		})
	if err != nil {
		t.Fatalf("cannot update elos: %v", err)
	}

	// Then the elos should be updated
	eloWinner, eloLoser, err := store.GetElos(gameName, winner, loser)
	if err != nil {
		t.Fatalf("error when getting elo: %v", err)
	}

	if eloWinner.UserID != winner.ID ||
		eloWinner.GameName != gameName ||
		eloWinner.CurrentElo != 20.0 ||
		eloWinner.GamesPlayed != 1 ||
		eloLoser.UserID != loser.ID ||
		eloLoser.GameName != gameName ||
		eloLoser.CurrentElo != 1.0 ||
		eloLoser.GamesPlayed != 1 {
		t.Fatalf("incorrect elo in db after update: %v, %v", eloWinner, eloLoser)
	}
}
