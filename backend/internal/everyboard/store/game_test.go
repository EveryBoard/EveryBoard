package store

import (
	"encoding/json"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"gorm.io/driver/sqlite"
)

func TestDBGameFlow(t *testing.T) {
	// Given a db with a game
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

	// When doing a regular flow for a game
	// Then it should work as expected

	// Adding an event
	err = store.AddEvent(game.GameID, &model.GameEvent{
		Timestamp: 42,
		User:      creator,
		Data:      model.EventDataRequest(model.PropositionDraw),
	})
	if err != nil {
		t.Fatalf("cannot add event: %v", err)
	}

	// Retrieving the events
	expectEvents := func(count int) {
		seen := 0
		err := store.ApplyToGameEvents(game.GameID, func(user *model.GameEvent) error {
			seen = seen + 1
			return nil
		})
		if err != nil {
			t.Fatalf("cannot apply to game events: %v", err)
		}
		if seen != count {
			t.Fatalf("there are missing or too many game events, I've seen %d instead of %d", seen, count)
		}
	}
	expectEvents(1)

	// Adding another event
	err = store.AddEvent(game.GameID, &model.GameEvent{
		Timestamp: 42,
		User:      opponent,
		Data:      model.EventDataRequest(model.PropositionDraw),
	})
	if err != nil {
		t.Fatalf("cannot add event: %v", err)
	}
	expectEvents(2)

	// Changing the game result
	err = store.SetGameResult(game, model.ResultAgreedDrawByOne)
	if err != nil {
		t.Fatalf("cannot change game result: %v", err)
	}

	game, err = store.GetGame(game.GameID)
	if err != nil {
		t.Fatalf("cannot retrieve game: %v", err)
	}
	if game.Result != model.ResultAgreedDrawByOne {
		t.Fatalf("game result has not changed, it is %v", game.Result)
	}

}

func TestManyGameEvents(t *testing.T) {
	// Given a db with a game
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

	// When doing a regular flow for a game
	// Then it should work as expected

	// Adding an event
	for range 42 {
		err = store.AddEvent(game.GameID, &model.GameEvent{
			Timestamp: 42,
			User:      creator,
			Data:      model.EventDataAddTime(model.AddTimeGame),
		})
		if err != nil {
			t.Fatalf("cannot add event: %v", err)
		}
	}

	// Retrieving the events
	expectEvents := func(count int) {
		seen := 0
		err := store.ApplyToGameEvents(game.GameID, func(user *model.GameEvent) error {
			seen = seen + 1
			return nil
		})
		if err != nil {
			t.Fatalf("cannot apply to game events: %v", err)
		}
		if seen != count {
			t.Fatalf("there are missing or too many game events, I've seen %d instead of %d", seen, count)
		}
	}
	expectEvents(42)
}

func TestGameCreationWithOpponentStarting(t *testing.T) {
	// Given a db with a config room where opponent will start
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
	configProposal := model.ConfigProposal{
		GameType:     model.GameTypeCustom,
		MoveDuration: 42,
		GameDuration: 4200,
		FirstPlayer:  model.FirstPlayerChosenOpponent,
		RulesConfig:  json.RawMessage(`{}`),
	}
	err = store.ProposeConfig(configRoom, configProposal)
	if err != nil {
		t.Fatalf("cannot propose config room: %v", err)
	}

	// When starting the game
	game, err := store.CreateGame(configRoom, 42, true)
	if err != nil {
		t.Fatalf("cannot create game: %v", err)
	}

	// Then the game should be created with opponent as player zero and creator as player one
	if game.PlayerZero.ID != opponent.ID || game.PlayerOne.ID != creator.ID {
		t.Fatalf("invalid players in game: %v", game)
	}
}

func TestGameCreationWithRandomFalseBoolean(t *testing.T) {
	// Given a db with a config room where a random player (set to false) will start
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
	configProposal := model.ConfigProposal{
		GameType:     model.GameTypeCustom,
		MoveDuration: 42,
		GameDuration: 4200,
		FirstPlayer:  model.FirstPlayerRandom,
		RulesConfig:  json.RawMessage(`{}`),
	}
	err = store.ProposeConfig(configRoom, configProposal)
	if err != nil {
		t.Fatalf("cannot propose config room: %v", err)
	}

	// When starting the game with a false boolean
	game, err := store.CreateGame(configRoom, 42, false)
	if err != nil {
		t.Fatalf("cannot create game: %v", err)
	}

	// Then the game should be created with opponent as player zero and creator as player one
	if game.PlayerZero.ID != opponent.ID || game.PlayerOne.ID != creator.ID {
		t.Fatalf("invalid players in game: %v", game)
	}
}

func TestGameCreationWithoutOpponentFails(t *testing.T) {
	// Given a db with a config room without opponent
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
	configProposal := model.ConfigProposal{
		GameType:     model.GameTypeCustom,
		MoveDuration: 42,
		GameDuration: 4200,
		FirstPlayer:  model.FirstPlayerRandom,
		RulesConfig:  json.RawMessage(`{}`),
	}
	err = store.ProposeConfig(configRoom, configProposal)
	if err != nil {
		t.Fatalf("cannot propose config room: %v", err)
	}

	// When starting the game
	_, err = store.CreateGame(configRoom, 42, true)
	// Then it should fail
	if err == nil {
		t.Fatalf("created a game succesfully although there is no opponent")
	}
}

func TestUnexistingGame(t *testing.T) {
	// Given a db
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	// When retrieving an unexisting game
	game, err := store.GetGame(42)
	// Then should return nil but no error
	if err != nil {
		t.Fatalf("error when getting unexisting game: %v", err)
	}
	if game != nil {
		t.Fatalf("getting unexisting game has retrieved something: %v", game)
	}
}
