package store

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
)

func TestGetCurrentGameWhenNone(t *testing.T) {
	// Given an empty db
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	// When getting the current game of a user who doesn't have one
	currentGame, err := store.GetCurrentGame(user)
	// Then it should return nil without error
	require.NoError(t, err, "cannot get missing current game")
	require.Nil(t, currentGame, "retrieved a current game even though it shouldn't")
}

func TestSetCurrentGame(t *testing.T) {
	// Given an empty db
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	// When setting the current game of the user
	gameName := "Go"
	role := model.UserRoleCreator
	currentGame := &model.CurrentGame{
		GameID:   42,
		GameName: gameName,
		UserID:   user.ID,
		UserName: user.Name,
		Creator:  user,
		Opponent: nil,
		Role:     role,
	}
	err = store.SetCurrentGame(currentGame)
	require.NoError(t, err, "error when setting current game")
	// Then it should be set
	currentGame, err = store.GetCurrentGame(user)
	require.NoError(t, err, "error when getting current game")
	require.NotNil(t, currentGame, "invalid current game in db")
	assert.Equal(t, model.GameID(42), currentGame.GameID, "invalid current game in db")
	assert.Equal(t, gameName, currentGame.GameName, "invalid current game in db")
	assert.Nil(t, currentGame.Opponent, "invalid current game in db")
	assert.Equal(t, role, currentGame.Role, "invalid current game in db")

}

func TestUpdateCurrentGame(t *testing.T) {
	// Given a db with a current game
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	gameName := "Go"
	role := model.UserRoleCreator
	currentGame := &model.CurrentGame{
		GameID:   42,
		UserID:   user.ID,
		UserName: user.Name,
		GameName: gameName,
		Creator:  user,
		Opponent: nil,
		Role:     role,
	}
	err = store.SetCurrentGame(currentGame)
	require.NoError(t, err, "error when setting current game")

	// When updating the current game
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	currentGame.Opponent = &opponent
	err = store.UpdateCurrentGame(user, currentGame)
	require.NoError(t, err, "error when updating current game")

	// Then it should be properly updated
	currentGame, err = store.GetCurrentGame(user)
	require.NoError(t, err, "error when getting current game")
	require.NotNil(t, currentGame, "invalid current game in db")
	assert.Equal(t, model.GameID(42), currentGame.GameID, "invalid current game in db")
	assert.Equal(t, gameName, currentGame.GameName, "invalid current game in db")
	require.NotNil(t, currentGame.Opponent, "invalid current game in db")
	assert.Equal(t, opponent.ID, currentGame.Opponent.ID, "invalid current game in db")
	assert.Equal(t, role, currentGame.Role, "invalid current game in db")

	// When clearing the opponent again
	currentGame.Opponent = nil
	err = store.UpdateCurrentGame(user, currentGame)
	require.NoError(t, err, "error when updating current game")

	// Then the nullable opponent columns should be cleared in the DB
	currentGame, err = store.GetCurrentGame(user)
	require.NoError(t, err, "error when getting current game")
	require.NotNil(t, currentGame, "current game opponent should have been cleared")
	assert.Nil(t, currentGame.Opponent, "current game opponent should have been cleared")
}

func TestRemoveCurrentGame(t *testing.T) {
	// Given a db with a current game
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	gameName := "Go"
	role := model.UserRoleCreator
	currentGame := &model.CurrentGame{
		GameID:   42,
		UserID:   user.ID,
		UserName: user.Name,
		GameName: gameName,
		Creator:  user,
		Opponent: nil,
		Role:     role,
	}
	err = store.SetCurrentGame(currentGame)
	require.NoError(t, err, "error when setting current game")

	// When removing the current game of the user
	err = store.RemoveCurrentGame(user)
	require.NoError(t, err, "error when removing current game")

	// Then it should be removed
	currentGame, err = store.GetCurrentGame(user)
	require.NoError(t, err, "error when getting current game")
	require.Nil(t, currentGame, "current game not properly removed")
}

func TestApplyToObservers(t *testing.T) {
	// Given a db with two users observing the same game
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")
	user1 := model.MinimalUser{ID: "foo", Name: "foo"}
	user2 := model.MinimalUser{ID: "bar", Name: "bar"}
	currentGame := &model.CurrentGame{
		GameID:   42,
		UserID:   user1.ID,
		UserName: user1.Name,
		GameName: "Go",
		Creator:  user1,
		Opponent: nil,
		Role:     model.UserRoleObserver,
	}
	err = store.SetCurrentGame(currentGame)
	require.NoError(t, err, "error when setting current game")

	currentGame2 := &model.CurrentGame{
		GameID:   42,
		UserID:   user2.ID,
		UserName: user2.Name,
		GameName: "Go",
		Creator:  user1,
		Opponent: nil,
		Role:     model.UserRoleObserver,
	}
	err = store.SetCurrentGame(currentGame2)
	require.NoError(t, err, "error when setting current game")
	// When applying to observers
	// Then we should see exactly two observers
	expectObservers := func(count int) {
		seen := 0
		err := store.ApplyToObservers(42, func(user model.MinimalUser) error {
			seen = seen + 1
			return nil
		})
		require.NoError(t, err, "cannot iterate observers")
		require.Equal(t, count, seen, "there are missing or too many observers")
	}
	expectObservers(2)
}
