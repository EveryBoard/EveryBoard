package store

import (
	"errors"
	"fmt"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"

	"gorm.io/gorm"
)

func (s *GORMStore) GetGame(gameID model.GameID) (*model.Game, error) {
	var game model.Game
	result := s.db.First(&game, "game_id = ?", gameID)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &game, wrapError("GetGame", result.Error)
}

// ListGames returns all persisted games, with the most recently started games
// first. GameID provides a stable ordering for games started at the same time.
func (s *GORMStore) ListGames() ([]model.Game, error) {
	var games []model.Game
	result := s.db.Order("beginning DESC").Order("game_id DESC").Find(&games)
	return games, wrapError("ListGames", result.Error)
}

func (s *GORMStore) CreateGame(configRoom *model.ConfigRoom, now int64, randBool bool) (*model.Game, error) {
	if configRoom.ChosenOpponent == nil {
		return nil, fmt.Errorf("cannot create a game if a config room has no opponent")
	}

	starter := configRoom.FirstPlayer
	if starter == model.FirstPlayerRandom {
		if randBool {
			starter = model.FirstPlayerCreator
		} else {
			starter = model.FirstPlayerChosenOpponent
		}
	}

	var playerZero model.MinimalUser
	var playerZeroElo float64
	var playerZeroBotIdentifier *model.BotIdentifier
	var playerOne model.MinimalUser
	var playerOneElo float64
	var playerOneBotIdentifier *model.BotIdentifier
	if starter == model.FirstPlayerCreator {
		playerZero = configRoom.Creator
		playerZeroElo = configRoom.CreatorElo
		playerZeroBotIdentifier = configRoom.CreatorBotIdentifier
		playerOne = *configRoom.ChosenOpponent
		playerOneElo = *configRoom.ChosenOpponentElo
		playerOneBotIdentifier = configRoom.ChosenOpponentBotIdentifier
	} else {
		playerZero = *configRoom.ChosenOpponent
		playerZeroElo = *configRoom.ChosenOpponentElo
		playerZeroBotIdentifier = configRoom.ChosenOpponentBotIdentifier
		playerOne = configRoom.Creator
		playerOneElo = configRoom.CreatorElo
		playerOneBotIdentifier = configRoom.CreatorBotIdentifier
	}

	game := model.Game{
		GameID:                  configRoom.ID,
		GameName:                configRoom.GameName,
		PlayerZero:              playerZero,
		PlayerZeroElo:           playerZeroElo,
		PlayerZeroBotIdentifier: playerZeroBotIdentifier,
		PlayerOne:               playerOne,
		PlayerOneElo:            playerOneElo,
		PlayerOneBotIdentifier:  playerOneBotIdentifier,
		Result:                  model.ResultInProgress,
		Beginning:               now,
	}
	result := s.db.Create(&game)
	return &game, wrapError("CreateGame", result.Error)
}

func (s *GORMStore) SetGameResult(game *model.Game, gameResult model.Result) error {
	result := s.db.Model(game).Updates(model.Game{
		Result: gameResult,
	})
	game.Result = gameResult
	return wrapError("SetResult", result.Error)
}

func (s *GORMStore) AddEvent(gameID model.GameID, event *model.GameEvent) error {
	event.GameID = gameID
	result := s.db.Create(event)
	return wrapError("AddEvent", result.Error)
}

func (s *GORMStore) ApplyToGameEvents(gameID model.GameID, action func(*model.GameEvent) error) error {
	result := s.db.Model(&model.GameEvent{}).Where("game_id = ?", gameID).Order("timestamp ASC")
	return wrapError("ApplyToGameEvents", applyToQueryResult(s.db, result, action))
}
