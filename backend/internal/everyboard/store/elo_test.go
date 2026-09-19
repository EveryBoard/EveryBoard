package store

import (
	"sync"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
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
	require.NoError(t, err, "cannot update elos")

	// GetElos should retrieve them
	ew, el, err := store.GetElos("test", winner, loser)
	require.NoError(t, err, "error when getting elo")
	assert.Equal(t, 100.0, ew.CurrentElo, "expected 100 and 50")
	assert.Equal(t, 50.0, el.CurrentElo, "expected 100 and 50")
}

func TestGetElosMissingUser(t *testing.T) {
	store, _ := InitDatabase(sqlite.Open(":memory:"))
	u1 := model.MinimalUser{ID: "u1", Name: "u1"}
	u2 := model.MinimalUser{ID: "u2", Name: "u2"}

	// Should work even if users don't exist (returns 0.0 elo)
	ew, el, err := store.GetElos("test", u1, u2)
	require.NoError(t, err, "error when getting elo")
	assert.Equal(t, 0.0, ew.CurrentElo, "expected 0.0 elos")
	assert.Equal(t, 0.0, el.CurrentElo, "expected 0.0 elos")
}

func TestGetEloEmptyDB(t *testing.T) {
	// Given a empty db
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")
	// When retrieving a model.Elo which does not exists
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	gameName := "Go"
	elo, err := store.GetElo(gameName, user)
	// Then it should give an empty model.Elo
	require.NoError(t, err, "cannot get missing elo")
	require.NotNil(t, elo, "invalid elo returned")
	assert.Equal(t, user.ID, elo.UserID, "invalid elo returned")
	assert.Equal(t, gameName, elo.GameName, "invalid elo returned")
}

func TestGetEloConcurrentFirstCreate(t *testing.T) {
	// Given a db with no model.Elo for a user yet
	store, err := InitDatabase(sqlite.Open("file:elo_concurrency?mode=memory&cache=shared&_busy_timeout=5000"))
	require.NoError(t, err, "cannot initialize db")
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
		require.NoError(t, err, "cannot get elo concurrently")
	}
	var count int64
	err = store.DB().Model(&model.Elo{}).
		Where("user_id = ? AND game_name = ?", user.ID, gameName).
		Count(&count).Error
	require.NoError(t, err, "cannot count model.Elo rows")
	require.Equal(t, int64(1), count, "expected exactly one model.Elo row")
}

func TestUpdateElos(t *testing.T) {
	// Given a db with some model.Elo
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")
	winner := model.MinimalUser{ID: "foo", Name: "foo"}
	loser := model.MinimalUser{ID: "bar", Name: "bar"}

	// Accessing the elos ensure that they are initialized (to 0)
	gameName := "Go"
	_, err = store.GetElo(gameName, winner)
	require.NoError(t, err, "error when getting elo")
	_, err = store.GetElo(gameName, loser)
	require.NoError(t, err, "error when getting elo")

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
	require.NoError(t, err, "cannot update elos")

	// Then the elos should be updated
	eloWinner, eloLoser, err := store.GetElos(gameName, winner, loser)
	require.NoError(t, err, "error when getting elo")

	assert.Equal(t, winner.ID, eloWinner.UserID, "incorrect elo in db after update")
	assert.Equal(t, gameName, eloWinner.GameName, "incorrect elo in db after update")
	assert.Equal(t, 20.0, eloWinner.CurrentElo, "incorrect elo in db after update")
	assert.Equal(t, uint(1), eloWinner.GamesPlayed, "incorrect elo in db after update")
	assert.Equal(t, loser.ID, eloLoser.UserID, "incorrect elo in db after update")
	assert.Equal(t, gameName, eloLoser.GameName, "incorrect elo in db after update")
	assert.Equal(t, 1.0, eloLoser.CurrentElo, "incorrect elo in db after update")
	assert.Equal(t, uint(1), eloLoser.GamesPlayed, "incorrect elo in db after update")
}
