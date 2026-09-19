package store

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
)

func TestConfigRoomFlow(t *testing.T) {
	// Given a DB
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")

	// When we perform the usual config room flow
	// Then there should be no errors
	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	// Create the initial config room
	configRoom, err := store.CreateConfigRoom(creator, gameName)
	require.NoError(t, err, "cannot create config room")
	assert.Equal(t, model.StatusCreated, configRoom.Status, "created config room is not as expected")
	assert.Equal(t, creator, configRoom.Creator, "created config room is not as expected")
	assert.Equal(t, gameName, configRoom.GameName, "created config room is not as expected")

	// Add a candidate
	err = store.AddCandidate(configRoom, opponent, 42)
	require.NoError(t, err, "cannot add candidate")

	// Select an opponent
	err = store.SelectOpponent(configRoom, opponent)
	require.NoError(t, err, "cannot select opponent")
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	require.NoError(t, err, "cannot get config room")
	require.NotNil(t, configRoom, "config room does not exist anymore")
	require.NotNil(t, configRoom.ChosenOpponent, "selected opponent is not as expected")
	assert.Equal(t, opponent, *configRoom.ChosenOpponent, "selected opponent is not as expected")

	// Unselect them
	err = store.RemoveOpponent(configRoom)
	require.NoError(t, err, "cannot remove opponent")
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	require.NoError(t, err, "cannot get config room")
	require.Nil(t, configRoom.ChosenOpponent, "removing opponent has not removed them")

	// Select them again for the right flow
	err = store.SelectOpponent(configRoom, opponent)
	require.NoError(t, err, "cannot select opponent")

	// Propose the config room
	configProposal := model.ConfigProposal{
		GameType:     model.GameTypeCustom,
		MoveDuration: 42,
		GameDuration: 4200,
		FirstPlayer:  model.FirstPlayerCreator,
		RulesConfig:  json.RawMessage(`{}`),
	}
	err = store.ProposeConfig(configRoom, configProposal)
	require.NoError(t, err, "cannot propose config")
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	require.NoError(t, err, "cannot get config room")
	assert.Equal(t, configProposal.GameType, configRoom.GameType, "config room after proposal is not as expected")
	assert.Equal(t, configProposal.MoveDuration, configRoom.MoveDuration, "config room after proposal is not as expected")
	assert.Equal(t, configProposal.GameDuration, configRoom.GameDuration, "config room after proposal is not as expected")
	assert.Equal(t, configProposal.FirstPlayer, configRoom.FirstPlayer, "config room after proposal is not as expected")
	assert.True(t, bytes.Equal(configProposal.RulesConfig, configRoom.RulesConfig), "config room after proposal is not as expected")
	assert.Equal(t, model.StatusConfigProposed, configRoom.Status, "config room after proposal is not as expected")

	// Review the config
	err = store.ReviewConfig(configRoom)
	require.NoError(t, err, "cannot review config room")
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	require.NoError(t, err, "cannot get config room")
	require.Equal(t, model.StatusCreated, configRoom.Status, "config room after review should be as created but is not")

	// Propose again (for the flow)
	err = store.ProposeConfig(configRoom, configProposal)
	require.NoError(t, err, "cannot propose config")

	// Start the config room
	err = store.StartConfigRoom(configRoom)
	require.NoError(t, err, "cannot start the config room")
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	require.NoError(t, err, "cannot get config room")
	require.Equal(t, model.StatusStarted, configRoom.Status, "config room after starting should be as started but is not")

	// Finish the config room
	err = store.FinishConfigRoom(configRoom)
	require.NoError(t, err, "cannot finish the config room")
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	require.NoError(t, err, "cannot get config room")
	require.Equal(t, model.StatusFinished, configRoom.Status, "config room after finishing should be as finished but is not")

	// Delete the config room
	err = store.DeleteConfigRoom(configRoom)
	require.NoError(t, err, "cannot delete config room")
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	require.NoError(t, err, "cannot get config room")
	require.Nil(t, configRoom, "config room still exists but should not")
}

func TestSelectOpponentRequiresCandidate(t *testing.T) {
	// Given a config room with no candidates
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	configRoom, err := store.CreateConfigRoom(creator, "Go")
	require.NoError(t, err, "cannot create config room")

	// When selecting an opponent that never joined as a candidate
	err = store.SelectOpponent(configRoom, opponent)

	// Then it should fail and leave the config room without an opponent
	require.Error(t, err, "expected selecting a non-candidate opponent to fail")
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	require.NoError(t, err, "cannot get config room")
	require.Nil(t, configRoom.ChosenOpponent, "missing candidate was selected as opponent")
}

func TestRematchForCreator(t *testing.T) {
	// Given a db with a config room and a game
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

	// When creating a rematch
	// Then it should work
	rematch, err := store.CreateRematch(configRoom, creator, game)
	require.NoError(t, err, "cannot create rematch")
	assert.NotEqual(t, configRoom.ID, rematch.ID, "rematch config room not as expected")
	assert.Equal(t, creator.ID, rematch.Creator.ID, "rematch config room not as expected")
	require.NotNil(t, rematch.ChosenOpponent, "rematch config room not as expected")
	require.NotNil(t, configRoom.ChosenOpponent, "rematch config room not as expected")
	assert.Equal(t, configRoom.ChosenOpponent.ID, rematch.ChosenOpponent.ID, "rematch config room not as expected")
	assert.Equal(t, model.StatusStarted, rematch.Status, "rematch config room not as expected")
	assert.Equal(t, configRoom.GameType, rematch.GameType, "rematch config room not as expected")
	assert.Equal(t, configRoom.GameDuration, rematch.GameDuration, "rematch config room not as expected")
	assert.True(t, bytes.Equal(configRoom.RulesConfig, rematch.RulesConfig), "rematch config room not as expected")
	assert.Equal(t, configRoom.GameName, rematch.GameName, "rematch config room not as expected")
}

func TestRematchForOpponent(t *testing.T) {
	// Given a db with a config room and a game
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

	// When creating a rematch
	// Then it should work
	rematch, err := store.CreateRematch(configRoom, opponent, game)
	require.NoError(t, err, "cannot create rematch")
	assert.NotEqual(t, configRoom.ID, rematch.ID, "rematch config room not as expected")
	assert.Equal(t, opponent.ID, rematch.Creator.ID, "rematch config room not as expected")
	require.NotNil(t, rematch.ChosenOpponent, "rematch config room not as expected")
	assert.Equal(t, configRoom.Creator.ID, rematch.ChosenOpponent.ID, "rematch config room not as expected")
	assert.Equal(t, model.StatusStarted, rematch.Status, "rematch config room not as expected")
	assert.Equal(t, configRoom.GameType, rematch.GameType, "rematch config room not as expected")
	assert.Equal(t, configRoom.GameDuration, rematch.GameDuration, "rematch config room not as expected")
	assert.True(t, bytes.Equal(configRoom.RulesConfig, rematch.RulesConfig), "rematch config room not as expected")
	assert.Equal(t, configRoom.GameName, rematch.GameName, "rematch config room not as expected")
}

func TestIterateOverConfigrooms(t *testing.T) {
	gameName := "Go"
	// Given an empty database
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")

	// When we iterate over the config rooms
	// Then there should be none
	expectConfigRooms := func(count int) {
		seen := 0
		err := store.ApplyToConfigRooms(func(configroom model.ConfigRoom) error {
			seen = seen + 1
			return nil
		})
		require.NoError(t, err, "cannot iterate config rooms")
		require.Equal(t, count, seen, "there are missing or too many config rooms")
	}
	expectConfigRooms(0)

	// And when we add one and iterate again
	creator1 := model.MinimalUser{ID: "foo", Name: "foo"}
	_, err = store.CreateConfigRoom(creator1, gameName)
	require.NoError(t, err, "cannot create config room")
	// Then there should be one
	expectConfigRooms(1)

	// And when we add another one
	creator2 := model.MinimalUser{ID: "bar", Name: "bar"}
	_, err = store.CreateConfigRoom(creator2, gameName)
	require.NoError(t, err, "cannot create config room")
	// Then there should be two
	expectConfigRooms(2)
}

func TestCandidatesFlow(t *testing.T) {
	// Given a database with a config room
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")
	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	configRoom, err := store.CreateConfigRoom(creator, gameName)
	require.NoError(t, err, "cannot create config room")

	// When doing an usual flow with candidates
	// Then it should work as expected
	candidate1 := model.MinimalUser{ID: "bar", Name: "bar"}
	candidate2 := model.MinimalUser{ID: "baz", Name: "baz"}
	err = store.AddCandidate(configRoom, candidate1, 0)
	require.NoError(t, err, "cannot add candidate")
	err = store.AddCandidate(configRoom, candidate2, 0)
	require.NoError(t, err, "cannot add candidate")

	expectCandidates := func(count int) {
		candidatesSeen := 0
		err := store.ApplyToCandidates(configRoom.ID, func(candidate model.Candidate) error {
			candidatesSeen = candidatesSeen + 1
			return nil
		})
		require.NoError(t, err, "cannot iterate candidates")
		require.Equal(t, count, candidatesSeen, "there are missing or too many candidates")
	}

	expectCandidates(2)
	err = store.DeleteCandidate(configRoom, candidate1.ID)
	require.NoError(t, err, "cannot delete candidate")

	expectCandidates(1)
}

func TestPostgresApplyToCandidatesShouldAllowQueriesInCallback(t *testing.T) {
	// Given a PostgreSQL database containing a candidate with an Elo
	database := postgresTestStore(t)
	creator := model.MinimalUser{ID: "creator", Name: "creator"}
	candidate := model.MinimalUser{ID: "candidate", Name: "candidate"}
	configRoom, err := database.CreateConfigRoom(creator, "Abalone")
	require.NoError(t, err, "cannot create config room")
	candidateElo, err := database.GetElo(configRoom.GameName, candidate)
	require.NoError(t, err, "cannot create candidate Elo")
	err = database.AddCandidate(configRoom, candidate, candidateElo.CurrentElo)
	require.NoError(t, err, "cannot add candidate")

	// When querying the database from an ApplyToCandidates callback
	seenCandidates := 0
	err = database.Transaction(func(transaction Store) error {
		return transaction.ApplyToCandidates(configRoom.ID, func(candidate model.Candidate) error {
			seenCandidates++
			_, err := transaction.GetElo(configRoom.GameName, candidate.User)
			return err
		})
	})

	// Then the query and candidate iteration should succeed
	require.NoError(t, err, "candidate Elo lookup should succeed during iteration")
	require.Equal(t, 1, seenCandidates, "should iterate over the candidate")
}
