package store

import (
	"errors"
	"fmt"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"

	"gorm.io/gorm"
)

func (s *GORMStore) GetGame(gameId model.GameID) (*model.Game, error) {
	var game model.Game
	result := s.db.First(&game, "game_id = ?", gameId)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &game, wrapError("GetGame", result.Error)
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
	var playerOne model.MinimalUser
	var playerOneElo float64
	if starter == model.FirstPlayerCreator {
		playerZero = configRoom.Creator
		playerZeroElo = configRoom.CreatorElo
		playerOne = *configRoom.ChosenOpponent
		playerOneElo = *configRoom.ChosenOpponentElo
	} else {
		playerZero = *configRoom.ChosenOpponent
		playerZeroElo = *configRoom.ChosenOpponentElo
		playerOne = configRoom.Creator
		playerOneElo = configRoom.CreatorElo
	}

	game := model.Game{
		GameID:        configRoom.ID,
		GameName:      configRoom.GameName,
		PlayerZero:    playerZero,
		PlayerZeroElo: playerZeroElo,
		PlayerOne:     playerOne,
		PlayerOneElo:  playerOneElo,
		Result:        model.ResultInProgress,
		Beginning:     now,
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

func (s *GORMStore) AddEvent(gameId model.GameID, event *model.GameEvent) error {
	event.GameID = gameId
	result := s.db.Create(event)
	return wrapError("AddEvent", result.Error)
}

func (s *GORMStore) ApplyToGameEvents(gameId model.GameID, action func(*model.GameEvent) error) error {
	result := s.db.Model(&model.GameEvent{}).Where("game_id = ?", gameId).Order("timestamp ASC")
	return wrapError("ApplyToGameEvents", applyToQueryResult(s.db, result, action))
}
