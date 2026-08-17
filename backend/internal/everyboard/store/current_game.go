package store

import (
	"errors"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"

	"gorm.io/gorm"
)

func (s *GORMStore) GetCurrentGame(user model.MinimalUser) (*model.CurrentGame, error) {
	var currentGame model.CurrentGame
	result := s.db.Model(&model.CurrentGame{}).Where("user_id = ?", user.ID).First(&currentGame)
	if result.RowsAffected == 0 {
		return nil, nil // No current game
	}
	return &currentGame, wrapError("GetCurrentGame", result.Error)
}

func (s *GORMStore) SetCurrentGame(currentGame *model.CurrentGame) error {
	result := s.db.Create(currentGame)
	if errors.Is(result.Error, gorm.ErrDuplicatedKey) {
		return apperror.ErrorAlreadySubscribed
	}
	return wrapError("SetCurrentGame", result.Error)
}

// Update the current game of an user. Different from SetCurrentGame which sets
// it initially, here we change e.g., the opponent displayed
func (s *GORMStore) UpdateCurrentGame(user model.MinimalUser, currentGame *model.CurrentGame) error {
	var opponentID any
	var opponentName any
	if currentGame.Opponent != nil {
		opponentID = currentGame.Opponent.ID
		opponentName = currentGame.Opponent.Name
	}
	result := s.db.Model(&model.CurrentGame{}).Where("user_id = ?", user.ID).Updates(map[string]any{
		"user_name":     currentGame.User.Name,
		"game_id":       currentGame.GameID,
		"game_name":     currentGame.GameName,
		"creator_id":    currentGame.Creator.ID,
		"creator_name":  currentGame.Creator.Name,
		"opponent_id":   opponentID,
		"opponent_name": opponentName,
		"role":          currentGame.Role,
	})
	return wrapError("UpdateCurrentGame", result.Error)
}

func (s *GORMStore) RemoveCurrentGame(user model.MinimalUser) error {
	result := s.db.Model(&model.CurrentGame{}).Where("user_id = ?", user.ID).Delete(&model.CurrentGame{})
	return wrapError("RemoveCurrentGame", result.Error)
}
func (s *GORMStore) ApplyToObservers(gameId model.GameID, action func(model.MinimalUser) error) error {
	result := s.db.Model(&model.CurrentGame{}).Where("game_id = ? and role = 'Observer'", gameId)
	return wrapError("ApplyToObservers", applyToQueryResult(s.db, result, func(currentGame model.CurrentGame) error {
		return action(currentGame.User)
	}))
}
