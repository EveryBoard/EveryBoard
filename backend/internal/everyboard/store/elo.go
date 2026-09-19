package store

import (
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func (s *GORMStore) GetElo(gameName string, user model.MinimalUser) (*model.Elo, error) {
	entry := model.Elo{UserID: user.ID, UserName: user.Name, GameName: gameName}
	result := s.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "game_name"}},
		DoNothing: true,
	}).Create(&entry)
	if result.Error != nil {
		return nil, wrapError("GetElo", result.Error)
	}

	result = s.db.Where("user_id = ? AND game_name = ?", user.ID, gameName).First(&entry)
	return &entry, wrapError("GetElo", result.Error)
}

// Internal function to update model.Elo within a transaction
func updateElo(tx *gorm.DB, gameName string, user model.MinimalUser, elo model.Elo) error {
	result := tx.Model(&model.Elo{}).Where("game_name = ? and user_id = ?", gameName, user.ID).Updates(elo)
	return wrapError("UpdateElo", result.Error)
}

func (s *GORMStore) GetElos(gameName string, winner model.MinimalUser, loser model.MinimalUser) (*model.Elo, *model.Elo, error) {
	eloWinner, err := s.GetElo(gameName, winner)
	if err != nil {
		return nil, nil, wrapError("GetElos", err)
	}

	eloLoser, err := s.GetElo(gameName, loser)
	if err != nil {
		return nil, nil, wrapError("GetElos", err)
	}
	return eloWinner, eloLoser, nil
}

func (s *GORMStore) UpdateElos(gameName string, winner model.MinimalUser, winnerElo model.Elo, loser model.MinimalUser, loserElo model.Elo) error {
	if err := updateElo(s.db, gameName, winner, winnerElo); err != nil {
		return wrapError("UpdateElos", err)
	}
	if err := updateElo(s.db, gameName, loser, loserElo); err != nil {
		return wrapError("UpdateElos", err)
	}
	return nil
}
