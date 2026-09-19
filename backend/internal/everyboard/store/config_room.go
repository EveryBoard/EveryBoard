package store

import (
	"errors"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"

	"gorm.io/gorm"
)

func (s *GORMStore) GetConfigRoom(gameId model.GameID) (*model.ConfigRoom, error) {
	var configRoom model.ConfigRoom
	result := s.db.First(&configRoom, "id = ?", gameId)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &configRoom, wrapError("GetConfigRoom", result.Error)
}

func (s *GORMStore) CreateConfigRoom(creator model.MinimalUser, gameName string) (*model.ConfigRoom, error) {
	creatorElo, err := s.GetElo(gameName, creator)
	if err != nil {
		return nil, err
	}

	configRoom := model.ConfigRoom{
		Creator:           creator,
		CreatorElo:        creatorElo.CurrentElo,
		FirstPlayer:       model.FirstPlayerRandom,
		ChosenOpponent:    nil,
		ChosenOpponentElo: nil,
		Status:            model.StatusCreated,
		GameType:          model.GameTypeStandard,
		MoveDuration:      model.StandardMoveDuration,
		GameDuration:      model.StandardGameDuration,
		RulesConfig:       nil,
		GameName:          gameName,
	}

	result := s.db.Create(&configRoom)
	return &configRoom, wrapError("CreateConfigRoom", result.Error)
}

func (s *GORMStore) DeleteConfigRoom(configRoom *model.ConfigRoom) error {
	result := s.db.Model(&model.ConfigRoom{}).Delete(configRoom)
	return wrapError("DeleteConfigRoom", result.Error)
}

func (s *GORMStore) SelectOpponent(configRoom *model.ConfigRoom, opponent model.MinimalUser) error {
	var candidate model.Candidate
	result := s.db.
		Where("game_id = ? AND user_id = ?", configRoom.ID, opponent.ID).
		First(&candidate)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return apperror.ErrorNotAllowed
	}
	if result.Error != nil {
		return wrapError("SelectOpponent", result.Error)
	}
	candidateElo := candidate.Elo
	result = s.db.Model(&model.ConfigRoom{}).Where("id = ?", configRoom.ID).Updates(model.ConfigRoom{ChosenOpponent: &opponent, ChosenOpponentElo: &candidateElo})
	if result.Error != nil {
		return wrapError("SelectOpponent", result.Error)
	}
	configRoom.ChosenOpponent = &opponent
	configRoom.ChosenOpponentElo = &candidateElo
	return nil
}

func (s *GORMStore) RemoveOpponent(configRoom *model.ConfigRoom) error {
	// A bit ugly because setting ChosenOpponent to nil will make gorm ignore this field...
	result := s.db.Model(configRoom).Updates(map[string]any{
		"chosen_opponent_id":   nil,
		"chosen_opponent_name": nil,
		"chosen_opponent_elo":  nil,
	})
	configRoom.ChosenOpponent = nil
	configRoom.ChosenOpponentElo = nil
	return wrapError("RemoveOpponent", result.Error)
}

func (s *GORMStore) ProposeConfig(configRoom *model.ConfigRoom, proposal model.ConfigProposal) error {
	result := s.db.Model(configRoom).Updates(model.ConfigRoom{
		GameType:     proposal.GameType,
		MoveDuration: proposal.MoveDuration,
		GameDuration: proposal.GameDuration,
		FirstPlayer:  proposal.FirstPlayer,
		RulesConfig:  proposal.RulesConfig,
		Status:       model.StatusConfigProposed,
	})
	configRoom.GameType = proposal.GameType
	configRoom.MoveDuration = proposal.MoveDuration
	configRoom.GameDuration = proposal.GameDuration
	configRoom.FirstPlayer = proposal.FirstPlayer
	configRoom.RulesConfig = proposal.RulesConfig
	configRoom.Status = model.StatusConfigProposed
	return wrapError("Propose", result.Error)
}

func (s *GORMStore) setStatus(configRoom *model.ConfigRoom, status model.Status) error {
	result := s.db.Model(configRoom).Updates(model.ConfigRoom{
		Status: status,
	})
	configRoom.Status = status
	return wrapError("SetStatus", result.Error)
}

func (s *GORMStore) ReviewConfig(configRoom *model.ConfigRoom) error {
	return s.setStatus(configRoom, model.StatusCreated)
}

func (s *GORMStore) StartConfigRoom(configRoom *model.ConfigRoom) error {
	return s.setStatus(configRoom, model.StatusStarted)
}

func (s *GORMStore) FinishConfigRoom(configRoom *model.ConfigRoom) error {
	return s.setStatus(configRoom, model.StatusFinished)
}

func (s *GORMStore) CreateRematch(configRoom *model.ConfigRoom, creator model.MinimalUser, game *model.Game) (*model.ConfigRoom, error) {
	// Get the new elo of the creator of the rematch
	creatorElo, err := s.GetElo(configRoom.GameName, creator)
	if err != nil {
		return nil, wrapError("CreateRematchConfigRoom", err)
	}

	// Compute who is the new opponent and who plays first
	var firstPlayer model.FirstPlayer
	var chosenOpponent model.MinimalUser
	if game.PlayerZero.ID == creator.ID {
		firstPlayer = model.FirstPlayerChosenOpponent
		chosenOpponent = game.PlayerOne
	} else {
		firstPlayer = model.FirstPlayerCreator
		chosenOpponent = game.PlayerZero
	}

	// Get the new elo of the opponent
	chosenOpponentElo, err := s.GetElo(configRoom.GameName, chosenOpponent)
	if err != nil {
		return nil, wrapError("CreateRematchConfigRoom", err)
	}

	// Create the config room for the rematch, as every game needs an associated config room
	rematchConfigRoom := model.ConfigRoom{
		Creator:           creator,
		CreatorElo:        creatorElo.CurrentElo,
		FirstPlayer:       firstPlayer,
		ChosenOpponent:    &chosenOpponent,
		ChosenOpponentElo: &chosenOpponentElo.CurrentElo,
		Status:            model.StatusStarted,
		GameType:          configRoom.GameType,
		MoveDuration:      configRoom.MoveDuration,
		GameDuration:      configRoom.GameDuration,
		RulesConfig:       configRoom.RulesConfig,
		GameName:          configRoom.GameName,
	}
	result := s.db.Create(&rematchConfigRoom)
	return &rematchConfigRoom, wrapError("CreateRematchConfigRoom", result.Error)
}
func (s *GORMStore) ApplyToConfigRooms(action func(model.ConfigRoom) error) error {
	result := s.db.Model(&model.ConfigRoom{}).Where("status != ?", model.StatusFinished)
	return wrapError("ApplyToConfigRooms", applyToQueryResult(s.db, result, action))
}

func (s *GORMStore) AddCandidate(configRoom *model.ConfigRoom, user model.MinimalUser, elo float64) error {
	result := s.db.Create(&model.Candidate{
		GameID: configRoom.ID,
		User:   user,
		Elo:    elo,
	})
	return wrapError("AddCandidate", result.Error)
}

func (s *GORMStore) DeleteCandidate(configRoom *model.ConfigRoom, uid string) error {
	result := s.db.Where("game_id = ? and user_id = ?", configRoom.ID, uid).Delete(&model.Candidate{})
	return wrapError("DeleteCandidate", result.Error)
}

func (s *GORMStore) ApplyToCandidates(gameId model.GameID, action func(model.Candidate) error) error {
	result := s.db.Model(&model.Candidate{}).Where("game_id = ?", gameId)
	return wrapError("ApplyToCandidates", applyToQueryResult(s.db, result, action))
}
