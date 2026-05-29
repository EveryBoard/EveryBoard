package store

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"gorm.io/driver/sqlite"
)

func TestGetCurrentGameWhenNone(t *testing.T) {
	// Given an empty db
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	// When getting the current game of a user who doesn't have one
	currentGame, err := store.GetCurrentGame(user)
	// Then it should return nil without error
	if err != nil {
		t.Fatalf("error when getting current game: %v", err)
	}
	if currentGame != nil {
		t.Fatalf("retrieved a current game even though it shouldn't: %v", currentGame)
	}
}

func TestSetCurrentGame(t *testing.T) {
	// Given an empty db
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
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
	if err != nil {
		t.Fatalf("error when setting current game: %v", err)
	}
	// Then it should be set
	currentGame, err = store.GetCurrentGame(user)
	if err != nil {
		t.Fatalf("error when getting current game: %v", err)
	}
	if currentGame == nil ||
		currentGame.GameID != 42 ||
		currentGame.GameName != gameName ||
		currentGame.Opponent != nil ||
		currentGame.Role != role {
		t.Fatalf("invalid current game in db: %v", currentGame)
	}

}

func TestUpdateCurrentGame(t *testing.T) {
	// Given a db with a current game
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
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
	if err != nil {
		t.Fatalf("error when setting current game: %v", err)
	}

	// When updating the current game
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	currentGame.Opponent = &opponent
	err = store.UpdateCurrentGame(user, currentGame)
	if err != nil {
		t.Fatalf("error when updating current game: %v", err)
	}

	// Then it should be properly updated
	currentGame, err = store.GetCurrentGame(user)
	if err != nil {
		t.Fatalf("error when getting current game: %v", err)
	}
	if currentGame == nil ||
		currentGame.GameID != 42 ||
		currentGame.GameName != gameName ||
		currentGame.Opponent == nil ||
		currentGame.Opponent.ID != opponent.ID ||
		currentGame.Role != role {
		t.Fatalf("invalid current game in db: %v", currentGame)
	}

	// When clearing the opponent again
	currentGame.Opponent = nil
	err = store.UpdateCurrentGame(user, currentGame)
	if err != nil {
		t.Fatalf("error when clearing current game opponent: %v", err)
	}

	// Then the nullable opponent columns should be cleared in the DB
	currentGame, err = store.GetCurrentGame(user)
	if err != nil {
		t.Fatalf("error when getting current game: %v", err)
	}
	if currentGame == nil || currentGame.Opponent != nil {
		t.Fatalf("current game opponent should have been cleared: %v", currentGame)
	}
}

func TestRemoveCurrentGame(t *testing.T) {
	// Given a db with a current game
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
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
	if err != nil {
		t.Fatalf("error when setting current game: %v", err)
	}

	// When removing the current game of the user
	err = store.RemoveCurrentGame(user)
	if err != nil {
		t.Fatalf("error when removing current game")
	}

	// Then it should be removed
	currentGame, err = store.GetCurrentGame(user)
	if err != nil {
		t.Fatalf("error when getting current game: %v", err)
	}
	if currentGame != nil {
		t.Fatalf("current game not properly removed")
	}
}

func TestApplyToObservers(t *testing.T) {
	// Given a db with two users observing the same game
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
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
	if err != nil {
		t.Fatalf("error when setting current game: %v", err)
	}

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
	if err != nil {
		t.Fatalf("error when setting current game: %v", err)
	}
	// When applying to observers
	// Then we should see exactly two observers
	expectObservers := func(count int) {
		seen := 0
		err := store.ApplyToObservers(42, func(user model.MinimalUser) error {
			seen = seen + 1
			return nil
		})
		if err != nil {
			t.Fatalf("cannot apply to observers: %v", err)
		}
		if seen != count {
			t.Fatalf("there are missing or too many observers, I've seen %d instead of %d", seen, count)
		}
	}
	expectObservers(2)
}
