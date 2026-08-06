package store

import (
	"encoding/json"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
)

func TestDBGameFlow(t *testing.T) {
	// Given a db with a game
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")

	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	configRoom, err := store.CreateConfigRoom(creator, gameName)
	require.NoError(t, err, "cannot create config room")
	err = store.AddCandidate(configRoom, opponent, 0)
	require.NoError(t, err, "cannot add candidate")
	err = store.SelectOpponent(configRoom, opponent)
	require.NoError(t, err, "cannot select opponent")
	game, err := store.CreateGame(configRoom, 42, true)
	require.NoError(t, err, "cannot create game")

	// When doing a regular flow for a game
	// Then it should work as expected

	// Adding an event
	err = store.AddEvent(game.GameID, &model.GameEvent{
		Timestamp: 42,
		User:      creator,
		Data:      model.EventDataRequest(model.PropositionDraw),
	})
	require.NoError(t, err, "cannot add game event")

	// Retrieving the events
	expectEvents := func(count int) {
		seen := 0
		err := store.ApplyToGameEvents(game.GameID, func(user *model.GameEvent) error {
			seen = seen + 1
			return nil
		})
		require.NoError(t, err, "cannot iterate game events")
		require.Equal(t, count, seen, "there are missing or too many game events")
	}
	expectEvents(1)

	// Adding another event
	err = store.AddEvent(game.GameID, &model.GameEvent{
		Timestamp: 42,
		User:      opponent,
		Data:      model.EventDataRequest(model.PropositionDraw),
	})
	require.NoError(t, err, "cannot add game event")
	expectEvents(2)

	// Changing the game result
	err = store.SetGameResult(game, model.ResultAgreedDrawByOne)
	require.NoError(t, err, "cannot change game result")

	game, err = store.GetGame(game.GameID)
	require.NoError(t, err, "cannot retrieve game")
	require.Equal(t, model.ResultAgreedDrawByOne, game.Result, "game result has not changed")

}

func TestManyGameEvents(t *testing.T) {
	// Given a db with a game
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")

	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	configRoom, err := store.CreateConfigRoom(creator, gameName)
	require.NoError(t, err, "cannot create config room")
	err = store.AddCandidate(configRoom, opponent, 0)
	require.NoError(t, err, "cannot add candidate")
	err = store.SelectOpponent(configRoom, opponent)
	require.NoError(t, err, "cannot select opponent")
	game, err := store.CreateGame(configRoom, 42, true)
	require.NoError(t, err, "cannot create game")

	// When doing a regular flow for a game
	// Then it should work as expected

	// Adding an event
	for range 42 {
		err = store.AddEvent(game.GameID, &model.GameEvent{
			Timestamp: 42,
			User:      creator,
			Data:      model.EventDataAddTime(model.AddTimeGame),
		})
		require.NoError(t, err, "cannot add game event")
	}

	// Retrieving the events
	expectEvents := func(count int) {
		seen := 0
		err := store.ApplyToGameEvents(game.GameID, func(user *model.GameEvent) error {
			seen = seen + 1
			return nil
		})
		require.NoError(t, err, "cannot iterate game events")
		require.Equal(t, count, seen, "there are missing or too many game events")
	}
	expectEvents(42)
}

func TestGameCreationWithOpponentStarting(t *testing.T) {
	// Given a db with a config room where opponent will start
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")
	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	configRoom, err := store.CreateConfigRoom(creator, gameName)
	require.NoError(t, err, "cannot create config room")
	err = store.AddCandidate(configRoom, opponent, 0)
	require.NoError(t, err, "cannot add candidate")
	err = store.SelectOpponent(configRoom, opponent)
	require.NoError(t, err, "cannot select opponent")
	configProposal := model.ConfigProposal{
		GameType:     model.GameTypeCustom,
		MoveDuration: 42,
		GameDuration: 4200,
		FirstPlayer:  model.FirstPlayerChosenOpponent,
		RulesConfig:  json.RawMessage(`{}`),
	}
	err = store.ProposeConfig(configRoom, configProposal)
	require.NoError(t, err, "cannot propose config")

	// When starting the game
	game, err := store.CreateGame(configRoom, 42, true)
	require.NoError(t, err, "cannot create game")

	// Then the game should be created with opponent as player zero and creator as player one
	assert.Equal(t, opponent.ID, game.PlayerZero.ID, "invalid players in game")
	assert.Equal(t, creator.ID, game.PlayerOne.ID, "invalid players in game")
}

func TestGameCreationWithRandomFalseBoolean(t *testing.T) {
	// Given a db with a config room where a random player (set to false) will start
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")
	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	configRoom, err := store.CreateConfigRoom(creator, gameName)
	require.NoError(t, err, "cannot create config room")
	err = store.AddCandidate(configRoom, opponent, 0)
	require.NoError(t, err, "cannot add candidate")
	err = store.SelectOpponent(configRoom, opponent)
	require.NoError(t, err, "cannot select opponent")
	configProposal := model.ConfigProposal{
		GameType:     model.GameTypeCustom,
		MoveDuration: 42,
		GameDuration: 4200,
		FirstPlayer:  model.FirstPlayerRandom,
		RulesConfig:  json.RawMessage(`{}`),
	}
	err = store.ProposeConfig(configRoom, configProposal)
	require.NoError(t, err, "cannot propose config")

	// When starting the game with a false boolean
	game, err := store.CreateGame(configRoom, 42, false)
	require.NoError(t, err, "cannot create game")

	// Then the game should be created with opponent as player zero and creator as player one
	assert.Equal(t, opponent.ID, game.PlayerZero.ID, "invalid players in game")
	assert.Equal(t, creator.ID, game.PlayerOne.ID, "invalid players in game")
}

func TestGameCreationWithoutOpponentFails(t *testing.T) {
	// Given a db with a config room without opponent
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")
	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	configRoom, err := store.CreateConfigRoom(creator, gameName)
	require.NoError(t, err, "cannot create config room")
	configProposal := model.ConfigProposal{
		GameType:     model.GameTypeCustom,
		MoveDuration: 42,
		GameDuration: 4200,
		FirstPlayer:  model.FirstPlayerRandom,
		RulesConfig:  json.RawMessage(`{}`),
	}
	err = store.ProposeConfig(configRoom, configProposal)
	require.NoError(t, err, "cannot propose config")

	// When starting the game
	_, err = store.CreateGame(configRoom, 42, true)
	// Then it should fail
	require.Error(t, err, "expected game creation without opponent to fail")
}

func TestUnexistingGame(t *testing.T) {
	// Given a db
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")
	// When retrieving an unexisting game
	game, err := store.GetGame(42)
	// Then should return nil but no error
	require.NoError(t, err, "cannot get missing game")
	require.Nil(t, game, "getting unexisting game has retrieved something")
}

func TestListGamesNewestFirst(t *testing.T) {
	// Given a database with two games created at different times
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")

	players := []model.MinimalUser{{ID: "foo", Name: "foo"}, {ID: "bar", Name: "bar"}}
	for _, beginning := range []int64{10, 20} {
		configRoom, createErr := store.CreateConfigRoom(players[0], "P4")
		require.NoError(t, createErr, "cannot create config room")
		require.NoError(t, store.AddCandidate(configRoom, players[1], 0), "cannot add candidate")
		require.NoError(t, store.SelectOpponent(configRoom, players[1]), "cannot select opponent")
		_, createErr = store.CreateGame(configRoom, beginning, true)
		require.NoError(t, createErr, "cannot create game")
	}

	// When listing the games
	games, err := store.ListGames()

	// Then the newest game should be listed first
	require.NoError(t, err, "cannot list games")
	require.Len(t, games, 2, "invalid number of games")
	assert.Equal(t, int64(20), games[0].Beginning, "newest game should be first")
	assert.Equal(t, int64(10), games[1].Beginning, "oldest game should be last")
}
