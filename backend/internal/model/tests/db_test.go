package model

import (
	"bytes"
	"encoding/json"
	"testing"

	"gorm.io/driver/sqlite"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

func TestInitializeDB(t *testing.T) {
	// When initializing the DB
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}

	// We should have a config room for the lobby
	lobby, err := model.GetConfigRoom(model.GameIDLobby)
	if err != nil {
		t.Errorf("error when accessing lobby: %v", err)
	}
	if lobby == nil || lobby.ID != model.GameIDLobby || lobby.GameName != "lobby" {
		t.Errorf("lobby doesn't exist upon db initialization")
	}
}

func TestConfigRoomFlow(t *testing.T) {
	// Given a DB
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}

	// When we perform the usual config room flow
	// Then there should be no errors
	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	// Create the initial config room
	configRoom, err := model.CreateConfigRoom(creator, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}
	if configRoom.Status != model.StatusCreated || configRoom.Creator != creator || configRoom.GameName != gameName {
		t.Fatalf("created config room is not as expected: %v", configRoom)
	}

	// Add a candidate
	err = configRoom.AddCandidate(opponent, 42)
	if err != nil {
		t.Fatalf("cannot add candidate: %v", err)
	}

	// Select an opponent
	err = configRoom.SelectOpponent(opponent)
	if err != nil {
		t.Fatalf("cannot select opponent: %v", err)
	}
	configRoom, err = model.GetConfigRoom(configRoom.ID)
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
	err = configRoom.RemoveOpponent()
	if err != nil {
		t.Fatalf("cannot remove opponent: %v", err)
	}
	configRoom, err = model.GetConfigRoom(configRoom.ID)
	if err != nil {
		t.Fatalf("cannot re-get config room: %v", err)
	}
	if configRoom.ChosenOpponent != nil {
		t.Fatalf("removing opponent has not removed them: %v", configRoom.ChosenOpponent)
	}

	// Select them again for the right flow
	err = configRoom.SelectOpponent(opponent)
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
	err = configRoom.Propose(configProposal)
	if err != nil {
		t.Fatalf("cannot propose config: %v", err)
	}
	configRoom, err = model.GetConfigRoom(configRoom.ID)
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
	err = configRoom.Review()
	if err != nil {
		t.Fatalf("cannot review config room: %v", err)
	}
	configRoom, err = model.GetConfigRoom(configRoom.ID)
	if err != nil {
		t.Fatalf("cannot re-get config room: %v", err)
	}
	if configRoom.Status != model.StatusCreated {
		t.Fatalf("config room after review should be as created but is not: %v", configRoom)
	}

	// Propose again (for the flow)
	err = configRoom.Propose(configProposal)
	if err != nil {
		t.Fatalf("cannot propose config: %v", err)
	}

	// Start the config room
	err = configRoom.Start()
	if err != nil {
		t.Fatalf("cannot start the config room: %v", err)
	}
	configRoom, err = model.GetConfigRoom(configRoom.ID)
	if err != nil {
		t.Fatalf("cannot re-get config room: %v", err)
	}
	if configRoom.Status != model.StatusStarted {
		t.Fatalf("config room after starting should be as started but is not: %v", configRoom)
	}

	// Finish the config room
	err = configRoom.Finish()
	if err != nil {
		t.Fatalf("cannot finish the config room: %v", err)
	}
	configRoom, err = model.GetConfigRoom(configRoom.ID)
	if err != nil {
		t.Fatalf("cannot re-get config room: %v", err)
	}
	if configRoom.Status != model.StatusFinished {
		t.Fatalf("config room after finishing should be as finished but is not: %v", configRoom)
	}

	// Delete the config room
	err = configRoom.Delete()
	if err != nil {
		t.Fatalf("cannot delete config room: %v", err)
	}
	configRoom, err = model.GetConfigRoom(configRoom.ID)
	if err != nil {
		t.Fatalf("error retrieving unexisting config room: %v", err)
	}
	if configRoom != nil {
		t.Fatalf("config room still exists but should not, got %v", configRoom)
	}
}

func TestRematchForCreator(t *testing.T) {
	// Given a db with a config room and a game
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	configRoom, err := model.CreateConfigRoom(creator, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}
	err = configRoom.AddCandidate(opponent, 0)
	if err != nil {
		t.Fatalf("cannot add candidate: %v", err)
	}
	err = configRoom.SelectOpponent(opponent)
	if err != nil {
		t.Fatalf("cannnot select opponent: %v", err)
	}
	game, err := configRoom.CreateGame(42, true)
	if err != nil {
		t.Fatalf("cannot create game: %v", err)
	}

	// When creating a rematch
	// Then it should work
	rematch, err := configRoom.CreateRematch(creator, *game)
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
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}

	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	configRoom, err := model.CreateConfigRoom(creator, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}
	err = configRoom.AddCandidate(opponent, 0)
	if err != nil {
		t.Fatalf("cannot add candidate: %v", err)
	}
	err = configRoom.SelectOpponent(opponent)
	if err != nil {
		t.Fatalf("cannnot select opponent: %v", err)
	}
	game, err := configRoom.CreateGame(42, true)
	if err != nil {
		t.Fatalf("cannot create game: %v", err)
	}

	// When creating a rematch
	// Then it should work
	rematch, err := configRoom.CreateRematch(opponent, *game)
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
	expectConfigRooms := func(count int) {
		seen := 0
		err := model.ApplyToConfigRooms(func(configroom model.ConfigRoom) error {
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
	gameName := "Go"
	// Given an empty database
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}

	// When we iterate over the config rooms
	// Then there should be none
	expectConfigRooms(0)

	// And when we add one and iterate again
	creator1 := model.MinimalUser{ID: "foo", Name: "foo"}
	_, err = model.CreateConfigRoom(creator1, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}
	// Then there should be one
	expectConfigRooms(1)

	// And when we add another one
	creator2 := model.MinimalUser{ID: "bar", Name: "bar"}
	_, err = model.CreateConfigRoom(creator2, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}
	// Then there should be two
	expectConfigRooms(2)
}

func TestCandidatesFlow(t *testing.T) {
	// Given a database with a config room
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	configRoom, err := model.CreateConfigRoom(creator, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}

	// When doing an usual flow with candidates
	// Then it should work as expected
	candidate1 := model.MinimalUser{ID: "bar", Name: "bar"}
	candidate2 := model.MinimalUser{ID: "baz", Name: "baz"}
	err = configRoom.AddCandidate(candidate1, 0)
	if err != nil {
		t.Fatalf("cannot add candidate: %v", err)
	}
	err = configRoom.AddCandidate(candidate2, 0)
	if err != nil {
		t.Fatalf("cannot add candidate: %v", err)
	}

	expectCandidates := func(count int) {
		candidatesSeen := 0
		err := model.ApplyToCandidates(configRoom.ID, func(candidate model.Candidate) error {
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
	err = configRoom.DeleteCandidate(candidate1.ID)
	if err != nil {
		t.Fatalf("cannot delete candidate: %v", err)
	}

	expectCandidates(1)
}

func TestDBGameFlow(t *testing.T) {
	// Given a db with a game
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}

	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	configRoom, err := model.CreateConfigRoom(creator, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}
	err = configRoom.AddCandidate(opponent, 0)
	if err != nil {
		t.Fatalf("cannot add candidate: %v", err)
	}
	err = configRoom.SelectOpponent(opponent)
	if err != nil {
		t.Fatalf("cannnot select opponent: %v", err)
	}
	game, err := configRoom.CreateGame(42, true)
	if err != nil {
		t.Fatalf("cannot create game: %v", err)
	}

	// When doing a regular flow for a game
	// Then it should work as expected

	// Adding an event
	err = model.AddEvent(game.GameID, model.GameEvent{
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
		err := model.ApplyToGameEvents(game.GameID, func(user *model.GameEvent) error {
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
	err = model.AddEvent(game.GameID, model.GameEvent{
		Timestamp: 42,
		User:      opponent,
		Data:      model.EventDataRequest(model.PropositionDraw),
	})
	if err != nil {
		t.Fatalf("cannot add event: %v", err)
	}
	expectEvents(2)

	// Changing the game result
	err = game.SetResult(model.ResultAgreedDrawByOne)
	if err != nil {
		t.Fatalf("cannot change game result: %v", err)
	}

	game, err = model.GetGame(game.GameID)
	if err != nil {
		t.Fatalf("cannot retrieve game: %v", err)
	}
	if game.Result != model.ResultAgreedDrawByOne {
		t.Fatalf("game result has not changed, it is %v", game.Result)
	}

}

func TestManyGameEvents(t *testing.T) {
	// Given a db with a game
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}

	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	configRoom, err := model.CreateConfigRoom(creator, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}
	err = configRoom.AddCandidate(opponent, 0)
	if err != nil {
		t.Fatalf("cannot add candidate: %v", err)
	}
	err = configRoom.SelectOpponent(opponent)
	if err != nil {
		t.Fatalf("cannnot select opponent: %v", err)
	}
	game, err := configRoom.CreateGame(42, true)
	if err != nil {
		t.Fatalf("cannot create game: %v", err)
	}

	// When doing a regular flow for a game
	// Then it should work as expected

	// Adding an event
	for range 42 {
		err = model.AddEvent(game.GameID, model.GameEvent{
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
		err := model.ApplyToGameEvents(game.GameID, func(user *model.GameEvent) error {
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
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	configRoom, err := model.CreateConfigRoom(creator, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}
	err = configRoom.AddCandidate(opponent, 0)
	if err != nil {
		t.Fatalf("cannot add candidate: %v", err)
	}
	err = configRoom.SelectOpponent(opponent)
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
	err = configRoom.Propose(configProposal)
	if err != nil {
		t.Fatalf("cannot propose config room: %v", err)
	}

	// When starting the game
	game, err := configRoom.CreateGame(42, true)
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
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	configRoom, err := model.CreateConfigRoom(creator, gameName)
	if err != nil {
		t.Fatalf("cannot create config room: %v", err)
	}
	err = configRoom.AddCandidate(opponent, 0)
	if err != nil {
		t.Fatalf("cannot add candidate: %v", err)
	}
	err = configRoom.SelectOpponent(opponent)
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
	err = configRoom.Propose(configProposal)
	if err != nil {
		t.Fatalf("cannot propose config room: %v", err)
	}

	// When starting the game with a false boolean
	game, err := configRoom.CreateGame(42, false)
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
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	gameName := "Go"
	creator := model.MinimalUser{ID: "foo", Name: "foo"}
	configRoom, err := model.CreateConfigRoom(creator, gameName)
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
	err = configRoom.Propose(configProposal)
	if err != nil {
		t.Fatalf("cannot propose config room: %v", err)
	}

	// When starting the game
	_, err = configRoom.CreateGame(42, true)
	// Then it should fail
	if err == nil {
		t.Fatalf("created a game succesfully although there is no opponent")
	}
}

func TestUnexistingGame(t *testing.T) {
	// Given a db
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	// When retrieving an unexisting game
	game, err := model.GetGame(42)
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
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	// When retrieving an Elo which does not exists
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	gameName := "Go"
	elo, err := model.GetElo(gameName, user)
	// Then it should give an empty Elo
	if err != nil {
		t.Fatalf("error when getting elo: %v", err)
	}
	if elo == nil || elo.User.ID != user.ID || elo.GameName != gameName {
		t.Fatalf("invalid elo returned: %v", elo)
	}
}

func TestUpdateElos(t *testing.T) {
	// Given a db with some Elo
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	winner := model.MinimalUser{ID: "foo", Name: "foo"}
	loser := model.MinimalUser{ID: "bar", Name: "bar"}

	// Accessing the elos ensure that they are initialized (to 0)
	gameName := "Go"
	_, err = model.GetElo(gameName, winner)
	if err != nil {
		t.Fatalf("error when getting elo: %v", err)
	}
	_, err = model.GetElo(gameName, loser)
	if err != nil {
		t.Fatalf("error when getting elo: %v", err)
	}

	// When updating the elos
	err = model.UpdateElos(gameName,
		winner, model.Elo{
			User:        winner,
			GameName:    gameName,
			CurrentElo:  20.0,
			GamesPlayed: 1,
		},
		loser, model.Elo{
			User:        loser,
			GameName:    gameName,
			CurrentElo:  1.0,
			GamesPlayed: 1,
		})
	if err != nil {
		t.Fatalf("cannot update elos: %v", err)
	}

	// Then the elos should be updated
	eloWinner, eloLoser, err := model.GetElos(gameName, winner, loser)
	if err != nil {
		t.Fatalf("error when getting elo: %v", err)
	}

	if eloWinner.User.ID != winner.ID ||
		eloWinner.GameName != gameName ||
		eloWinner.CurrentElo != 20.0 ||
		eloWinner.GamesPlayed != 1 ||
		eloLoser.User.ID != loser.ID ||
		eloLoser.GameName != gameName ||
		eloLoser.CurrentElo != 1.0 ||
		eloLoser.GamesPlayed != 1 {
		t.Fatalf("incorrect elo in db after update: %v, %v", eloWinner, eloLoser)
	}
}

func TestGetCurrentGameWhenNone(t *testing.T) {
	// Given an empty db
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	// When getting the current game of a user who doesn't have one
	currentGame, err := model.GetCurrentGame(user)
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
	err := model.InitDatabase(sqlite.Open(":memory:"))
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
		User:     user,
		Creator:  user,
		Opponent: nil,
		Role:     role,
	}
	err = model.SetCurrentGame(*currentGame)
	if err != nil {
		t.Fatalf("error when setting current game: %v", err)
	}
	// Then it should be set
	currentGame, err = model.GetCurrentGame(user)
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
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	gameName := "Go"
	role := model.UserRoleCreator
	currentGame := &model.CurrentGame{
		GameID:   42,
		User:     user,
		GameName: gameName,
		Creator:  user,
		Opponent: nil,
		Role:     role,
	}
	err = model.SetCurrentGame(*currentGame)
	if err != nil {
		t.Fatalf("error when setting current game: %v", err)
	}

	// When updating the current game
	opponent := model.MinimalUser{ID: "bar", Name: "bar"}
	currentGame.Opponent = &opponent
	err = model.UpdateCurrentGame(user, *currentGame)
	if err != nil {
		t.Fatalf("error when updating current game: %v", err)
	}

	// Then it should be properly updated
	currentGame, err = model.GetCurrentGame(user)
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
}

func TestRemoveCurrentGame(t *testing.T) {
	// Given a db with a current game
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	gameName := "Go"
	role := model.UserRoleCreator
	currentGame := &model.CurrentGame{
		GameID:   42,
		User:     user,
		GameName: gameName,
		Creator:  user,
		Opponent: nil,
		Role:     role,
	}
	err = model.SetCurrentGame(*currentGame)
	if err != nil {
		t.Fatalf("error when setting current game: %v", err)
	}

	// When removing the current game of the user
	err = model.RemoveCurrentGame(user)
	if err != nil {
		t.Fatalf("error when removing current game")
	}

	// Then it should be removed
	currentGame, err = model.GetCurrentGame(user)
	if err != nil {
		t.Fatalf("error when getting current game: %v", err)
	}
	if currentGame != nil {
		t.Fatalf("current game not properly removed")
	}
}

func TestApplyToObservers(t *testing.T) {
	// Given a db with two users observing the same game
	err := model.InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	user1 := model.MinimalUser{ID: "foo", Name: "foo"}
	user2 := model.MinimalUser{ID: "bar", Name: "bar"}
	currentGame := &model.CurrentGame{
		GameID:   42,
		User:     user1,
		GameName: "Go",
		Creator:  user1,
		Opponent: nil,
		Role:     model.UserRoleObserver,
	}
	err = model.SetCurrentGame(*currentGame)
	if err != nil {
		t.Fatalf("error when setting current game: %v", err)
	}

	currentGame.User = user2
	err = model.SetCurrentGame(*currentGame)
	if err != nil {
		t.Fatalf("error when setting current game: %v", err)
	}
	// When applying to observers
	// Then we should see exactly two observers
	expectObservers := func(count int) {
		seen := 0
		err := model.ApplyToObservers(42, func(user model.MinimalUser) error {
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
	err := model.InitDatabase(sqlite.Open(":memory:"))
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
	err = model.AddChatMessage(42, &message1)
	if err != nil {
		t.Fatalf("cannot add chat message: %v", err)
	}

	err = model.AddChatMessage(42, &message2)
	if err != nil {
		t.Fatalf("cannot add chat message: %v", err)
	}

	// Then they should be added and can be retrieved in timestamp order
	seenMessages := []model.Message{}
	err = model.ApplyToMessagesOfGame(42, func(m *model.Message) error {
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
