package store

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"gorm.io/driver/sqlite"
)

func TestConfigRoomFlow(t *testing.T) {
	// Given a DB
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}

	// When we perform the usual config room flow
	// Then there should be no errors
	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	// Create the initial config room
	configRoom, err := store.CreateConfigRoom(creator, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}
	if configRoom.Status != model.StatusCreated || configRoom.Creator != creator || configRoom.GameName != gameName {
		t.Fatalf("created config room is not as expected: %v", configRoom)
	}

	// Add a candidate
	err = store.AddCandidate(configRoom, opponent, 42)
	if err != nil {
		t.Fatalf("cannot add candidate: %v", err)
	}

	// Select an opponent
	err = store.SelectOpponent(configRoom, opponent)
	if err != nil {
		t.Fatalf("cannot select opponent: %v", err)
	}
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	if err != nil {
		t.Fatalf("cannot re-get config room: %v", err)
	}
	if configRoom == nil {
		t.Fatalf("config room does not exist anymore")
	}
	if configRoom.ChosenOpponent == nil || *configRoom.ChosenOpponent != opponent {
		t.Fatalf("selected opponent is not as expected: %v", configRoom.ChosenOpponent)
	}

	// Unselect them
	err = store.RemoveOpponent(configRoom)
	if err != nil {
		t.Fatalf("cannot remove opponent: %v", err)
	}
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	if err != nil {
		t.Fatalf("cannot re-get config room: %v", err)
	}
	if configRoom.ChosenOpponent != nil {
		t.Fatalf("removing opponent has not removed them: %v", configRoom.ChosenOpponent)
	}

	// Select them again for the right flow
	err = store.SelectOpponent(configRoom, opponent)
	if err != nil {
		t.Fatalf("cannot select opponent: %v", err)
	}

	// Propose the config room
	configProposal := model.ConfigProposal{
		GameType:     model.GameTypeCustom,
		MoveDuration: 42,
		GameDuration: 4200,
		FirstPlayer:  model.FirstPlayerCreator,
		RulesConfig:  json.RawMessage(`{}`),
	}
	err = store.ProposeConfig(configRoom, configProposal)
	if err != nil {
		t.Fatalf("cannot propose config: %v", err)
	}
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	if err != nil {
		t.Fatalf("cannot re-get config room: %v", err)
	}
	if configRoom.GameType != configProposal.GameType ||
		configRoom.MoveDuration != configProposal.MoveDuration ||
		configRoom.GameDuration != configProposal.GameDuration ||
		configRoom.FirstPlayer != configProposal.FirstPlayer ||
		!bytes.Equal(configRoom.RulesConfig, configProposal.RulesConfig) ||
		configRoom.Status != model.StatusConfigProposed {
		t.Fatalf("config room after proposal is not as expected: %v", configRoom)
	}

	// Review the config
	err = store.ReviewConfig(configRoom)
	if err != nil {
		t.Fatalf("cannot review config room: %v", err)
	}
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	if err != nil {
		t.Fatalf("cannot re-get config room: %v", err)
	}
	if configRoom.Status != model.StatusCreated {
		t.Fatalf("config room after review should be as created but is not: %v", configRoom)
	}

	// Propose again (for the flow)
	err = store.ProposeConfig(configRoom, configProposal)
	if err != nil {
		t.Fatalf("cannot propose config: %v", err)
	}

	// Start the config room
	err = store.StartConfigRoom(configRoom)
	if err != nil {
		t.Fatalf("cannot start the config room: %v", err)
	}
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	if err != nil {
		t.Fatalf("cannot re-get config room: %v", err)
	}
	if configRoom.Status != model.StatusStarted {
		t.Fatalf("config room after starting should be as started but is not: %v", configRoom)
	}

	// Finish the config room
	err = store.FinishConfigRoom(configRoom)
	if err != nil {
		t.Fatalf("cannot finish the config room: %v", err)
	}
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	if err != nil {
		t.Fatalf("cannot re-get config room: %v", err)
	}
	if configRoom.Status != model.StatusFinished {
		t.Fatalf("config room after finishing should be as finished but is not: %v", configRoom)
	}

	// Delete the config room
	err = store.DeleteConfigRoom(configRoom)
	if err != nil {
		t.Fatalf("cannot delete config room: %v", err)
	}
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	if err != nil {
		t.Fatalf("error retrieving unexisting config room: %v", err)
	}
	if configRoom != nil {
		t.Fatalf("config room still exists but should not, got %v", configRoom)
	}
}

func TestSelectOpponentRequiresCandidate(t *testing.T) {
	// Given a config room with no candidates
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	configRoom, err := store.CreateConfigRoom(creator, "Go")
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}

	// When selecting an opponent that never joined as a candidate
	err = store.SelectOpponent(configRoom, opponent)

	// Then it should fail and leave the config room without an opponent
	if err == nil {
		t.Fatalf("selecting a missing candidate should fail")
	}
	configRoom, err = store.GetConfigRoom(configRoom.ID)
	if err != nil {
		t.Fatalf("cannot re-get config room: %v", err)
	}
	if configRoom.ChosenOpponent != nil {
		t.Fatalf("missing candidate was selected as opponent: %v", configRoom.ChosenOpponent)
	}
}

func TestRematchForCreator(t *testing.T) {
	// Given a db with a config room and a game
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	configRoom, err := store.CreateConfigRoom(creator, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}
	err = store.AddCandidate(configRoom, opponent, 0)
	if err != nil {
		t.Fatalf("cannot add candidate: %v", err)
	}
	err = store.SelectOpponent(configRoom, opponent)
	if err != nil {
		t.Fatalf("cannnot select opponent: %v", err)
	}
	game, err := store.CreateGame(configRoom, 42, true)
	if err != nil {
		t.Fatalf("cannot create game: %v", err)
	}

	// When creating a rematch
	// Then it should work
	rematch, err := store.CreateRematch(configRoom, creator, game)
	if err != nil {
		t.Fatalf("cannot create rematch: %v", err)
	}
	if rematch.ID == configRoom.ID ||
		rematch.Creator.ID != creator.ID ||
		rematch.ChosenOpponent.ID != configRoom.ChosenOpponent.ID ||
		rematch.Status != model.StatusStarted ||
		rematch.GameType != configRoom.GameType ||
		rematch.GameDuration != configRoom.GameDuration ||
		!bytes.Equal(rematch.RulesConfig, configRoom.RulesConfig) ||
		rematch.GameName != configRoom.GameName {
		t.Fatalf("rematch config room not as expected: %v", rematch)
	}
}

func TestRematchForOpponent(t *testing.T) {
	// Given a db with a config room and a game
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}

	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	configRoom, err := store.CreateConfigRoom(creator, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}
	err = store.AddCandidate(configRoom, opponent, 0)
	if err != nil {
		t.Fatalf("cannot add candidate: %v", err)
	}
	err = store.SelectOpponent(configRoom, opponent)
	if err != nil {
		t.Fatalf("cannnot select opponent: %v", err)
	}
	game, err := store.CreateGame(configRoom, 42, true)
	if err != nil {
		t.Fatalf("cannot create game: %v", err)
	}

	// When creating a rematch
	// Then it should work
	rematch, err := store.CreateRematch(configRoom, opponent, game)
	if err != nil {
		t.Fatalf("cannot create rematch: %v", err)
	}
	if rematch.ID == configRoom.ID ||
		rematch.Creator.ID != opponent.ID ||
		rematch.ChosenOpponent.ID != configRoom.Creator.ID ||
		rematch.Status != model.StatusStarted ||
		rematch.GameType != configRoom.GameType ||
		rematch.GameDuration != configRoom.GameDuration ||
		!bytes.Equal(rematch.RulesConfig, configRoom.RulesConfig) ||
		rematch.GameName != configRoom.GameName {
		t.Fatalf("rematch config room not as expected: %v", rematch)
	}
}

func TestIterateOverConfigrooms(t *testing.T) {
	gameName := "Go"
	// Given an empty database
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}

	// When we iterate over the config rooms
	// Then there should be none
	expectConfigRooms := func(count int) {
		seen := 0
		err := store.ApplyToConfigRooms(func(configroom model.ConfigRoom) error {
			seen = seen + 1
			return nil
		})
		if err != nil {
			t.Fatalf("cannot apply to config rooms: %v", err)
		}
		if seen != count {
			t.Fatalf("there are missing or too many config rooms, I've seen %d instead of %d", seen, count)
		}
	}
	expectConfigRooms(0)

	// And when we add one and iterate again
	creator1 := model.MinimalUser{ID: "foo", Name: "foo"}
	_, err = store.CreateConfigRoom(creator1, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}
	// Then there should be one
	expectConfigRooms(1)

	// And when we add another one
	creator2 := model.MinimalUser{ID: "bar", Name: "bar"}
	_, err = store.CreateConfigRoom(creator2, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}
	// Then there should be two
	expectConfigRooms(2)
}

func TestCandidatesFlow(t *testing.T) {
	// Given a database with a config room
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	configRoom, err := store.CreateConfigRoom(creator, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}

	// When doing an usual flow with candidates
	// Then it should work as expected
	candidate1 := model.MinimalUser{ID: "bar", Name: "bar"}
	candidate2 := model.MinimalUser{ID: "baz", Name: "baz"}
	err = store.AddCandidate(configRoom, candidate1, 0)
	if err != nil {
		t.Fatalf("cannot add candidate: %v", err)
	}
	err = store.AddCandidate(configRoom, candidate2, 0)
	if err != nil {
		t.Fatalf("cannot add candidate: %v", err)
	}

	expectCandidates := func(count int) {
		candidatesSeen := 0
		err := store.ApplyToCandidates(configRoom.ID, func(candidate model.Candidate) error {
			candidatesSeen = candidatesSeen + 1
			return nil
		})
		if err != nil {
			t.Fatalf("cannot apply to candidates: %v", err)
		}
		if candidatesSeen != count {
			t.Fatalf("there are missing or too many candidates, I've seen %d instead of %d", candidatesSeen, count)
		}
	}

	expectCandidates(2)
	err = store.DeleteCandidate(configRoom, candidate1.ID)
	if err != nil {
		t.Fatalf("cannot delete candidate: %v", err)
	}

	expectCandidates(1)
}
