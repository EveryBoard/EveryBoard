package model

import (
	"bytes"
	"encoding/json"
	"sync"
	"testing"

	"gorm.io/driver/sqlite"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

func TestInitializeDB(t *testing.T) {
	// When initializing the DB
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}

	// We should have a config room for the lobby
	lobby, err := store.GetConfigRoom(model.GameIDLobby)
	if err != nil {
		t.Errorf("error when accessing lobby: %v", err)
	}
	if lobby == nil || lobby.ID != model.GameIDLobby || lobby.GameName != "lobby" {
		t.Errorf("lobby doesn't exist upon db initialization")
	}
}

func TestConfigRoomFlow(t *testing.T) {
	// Given a DB
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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

func TestDBGameFlow(t *testing.T) {
	// Given a db with a game
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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

func TestGetEloEmptyDB(t *testing.T) {
	// Given a empty db
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	// When retrieving an Elo which does not exists
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	gameName := "Go"
	elo, err := store.GetElo(gameName, user)
	// Then it should give an empty Elo
	if err != nil {
		t.Fatalf("error when getting elo: %v", err)
	}
	if elo == nil || elo.UserID != user.ID || elo.GameName != gameName {
		t.Fatalf("invalid elo returned: %v", elo)
	}
}

func TestGetEloConcurrentFirstCreate(t *testing.T) {
	// Given a db with no Elo for a user yet
	store, err := model.InitDatabase(sqlite.Open("file:elo_concurrency?mode=memory&cache=shared&_busy_timeout=5000"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	gameName := "Go"

	// When several goroutines create the same Elo concurrently
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
		t.Fatalf("cannot count Elo rows: %v", err)
	}
	if count != 1 {
		t.Fatalf("expected exactly one Elo row, got %d", count)
	}
}

func TestUpdateElos(t *testing.T) {
	// Given a db with some Elo
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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

func TestGetCurrentGameWhenNone(t *testing.T) {
	// Given an empty db
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
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

func TestChatMessageFlow(t *testing.T) {
	// Given a db
	store, err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	message1 := model.Message{
		Sender:    user,
		Timestamp: 1,
		Content:   "hello",
	}
	message2 := model.Message{
		Sender:    user,
		Timestamp: 2,
		Content:   "world",
	}
	// When adding messages
	err = store.AddChatMessage(42, &message1)
	if err != nil {
		t.Fatalf("cannot add chat message: %v", err)
	}

	err = store.AddChatMessage(42, &message2)
	if err != nil {
		t.Fatalf("cannot add chat message: %v", err)
	}

	// Then they should be added and can be retrieved in timestamp order
	seenMessages := []model.Message{}
	err = store.ApplyToMessagesOfGame(42, func(m *model.Message) error {
		seenMessages = append(seenMessages, *m)
		return nil
	})
	if err != nil {
		t.Fatalf("cannot apply to messages: %v", err)
	}
	if len(seenMessages) != 2 {
		t.Fatalf("should have seen 2 messages, but I've seen %d instead", len(seenMessages))
	}
	if seenMessages[0].Timestamp >= seenMessages[1].Timestamp {
		t.Fatalf("messages should be ordered by timestamp but are not")
	}
}
