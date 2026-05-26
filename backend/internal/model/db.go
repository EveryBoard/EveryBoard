package model

import (
	"errors"
	"fmt"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/logger"
)

func wrapError(ctx string, err error) error {
	if err == nil {
		return nil
	}
	return fmt.Errorf("error in %s: %w", ctx, err)
}

type GORMStore struct {
	db *gorm.DB
}

// Initialize the database given a dialector, which will either be in-memory
// SQLite for testing (sqlite.Open(":memory:")) or another DB for production (e.g., postgres.Open("some-dsn").)
func InitDatabase(dialector gorm.Dialector) (*GORMStore, error) {
	db, err := gorm.Open(dialector, &gorm.Config{
		Logger:         logger.Default.LogMode(logger.Silent), // we will log errors ourselves
		TranslateError: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to DB: %v", err)
	}

	switch dialector.(type) {
	case *sqlite.Dialector:
		// In case we have sqlite, we only want one connection. Otherwise, this renders tests flaky.
		sqlDB, _ := db.DB()
		sqlDB.SetMaxOpenConns(1)
		sqlDB.SetMaxIdleConns(1)
	}

	err = db.AutoMigrate(&ConfigRoom{})
	if err != nil {
		return nil, fmt.Errorf("cannot initialize DB (AutoMigrate ConfigRoom): %v", err)
	}

	// Create first config room, which is actually the lobby
	result := db.First(&ConfigRoom{}, "id = ?", GameIDLobby)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// The ID of the lobby will be the first available id, hence 1 (We can't
		// set it ourselves otherwise the "autoIncrement" feature of postgresql
		// will be confused and try to allocate 1 as the next id)
		lobby := ConfigRoom{
			Creator:     MinimalUser{Name: "", ID: ""},
			CreatorElo:  0,
			Status:      StatusFinished,
			FirstPlayer: FirstPlayerRandom,
			GameType:    GameTypeStandard,
			RulesConfig: nil,
			GameName:    "lobby",
		}
		result := db.Create(&lobby)
		if result.Error != nil {
			return nil, fmt.Errorf("cannot initialize DB (Create lobby): %v", result.Error)
		}
	}

	err = db.AutoMigrate(&Message{})
	if err != nil {
		return nil, fmt.Errorf("cannot initialize DB (AutoMigrate Message): %v", err)
	}

	err = db.AutoMigrate(&Elo{})
	if err != nil {
		return nil, fmt.Errorf("cannot initialize DB (AutoMigrate Elo): %v", err)
	}

	err = db.AutoMigrate(&Candidate{})
	if err != nil {
		return nil, fmt.Errorf("cannot initialize DB (AutoMigrate Candidate): %v", err)
	}

	err = db.AutoMigrate(&Game{})
	if err != nil {
		return nil, fmt.Errorf("cannot initialize DB (AutoMigrate Game): %v", err)
	}

	err = db.AutoMigrate(&GameEvent{})
	if err != nil {
		return nil, fmt.Errorf("cannot initialize DB (AutoMigrate GameEvent): %v", err)
	}

	err = db.AutoMigrate(&CurrentGame{})
	if err != nil {
		return nil, fmt.Errorf("cannot initialize DB: %v (AutoMigrate CurrentGame)", err)
	}
	return &GORMStore{db}, nil
}

func (s *GORMStore) DB() *gorm.DB {
	return s.db
}

func (s *GORMStore) Transaction(f func(store Store) error) error {
	return s.db.Transaction(func(db *gorm.DB) error {
		store := &GORMStore{db}
		return f(store)
	})
}

func (s *GORMStore) GetConfigRoom(gameId GameID) (*ConfigRoom, error) {
	var configRoom ConfigRoom
	result := s.db.First(&configRoom, "id = ?", gameId)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &configRoom, wrapError("GetConfigRoom", result.Error)
}

func (s *GORMStore) CreateConfigRoom(creator MinimalUser, gameName string) (*ConfigRoom, error) {
	creatorElo, err := s.GetElo(gameName, creator)
	if err != nil {
		return nil, err
	}

	configRoom := ConfigRoom{
		Creator:           creator,
		CreatorElo:        creatorElo.CurrentElo,
		FirstPlayer:       FirstPlayerRandom,
		ChosenOpponent:    nil,
		ChosenOpponentElo: nil,
		Status:            StatusCreated,
		GameType:          GameTypeStandard,
		MoveDuration:      StandardMoveDuration,
		GameDuration:      StandardGameDuration,
		RulesConfig:       nil,
		GameName:          gameName,
	}

	result := s.db.Create(&configRoom)
	return &configRoom, wrapError("CreateConfigRoom", result.Error)
}

func (s *GORMStore) DeleteConfigRoom(configRoom *ConfigRoom) error {
	result := s.db.Model(&ConfigRoom{}).Delete(configRoom)
	return wrapError("DeleteConfigRoom", result.Error)
}

func (s *GORMStore) SelectOpponent(configRoom *ConfigRoom, opponent MinimalUser) error {
	var candidate Candidate
	result := s.db.
		Where("game_id = ? AND user_id = ?", configRoom.ID, opponent.ID).
		First(&candidate)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return ErrorNotAllowed
	}
	if result.Error != nil {
		return wrapError("SelectOpponent", result.Error)
	}
	candidateElo := candidate.Elo
	result = s.db.Model(&ConfigRoom{}).Where("id = ?", configRoom.ID).Updates(ConfigRoom{ChosenOpponent: &opponent, ChosenOpponentElo: &candidateElo})
	if result.Error != nil {
		return wrapError("SelectOpponent", result.Error)
	}
	configRoom.ChosenOpponent = &opponent
	configRoom.ChosenOpponentElo = &candidateElo
	return nil
}

func (s *GORMStore) RemoveOpponent(configRoom *ConfigRoom) error {
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

func (s *GORMStore) ProposeConfig(configRoom *ConfigRoom, proposal ConfigProposal) error {
	result := s.db.Model(configRoom).Updates(ConfigRoom{
		GameType:     proposal.GameType,
		MoveDuration: proposal.MoveDuration,
		GameDuration: proposal.GameDuration,
		FirstPlayer:  proposal.FirstPlayer,
		RulesConfig:  proposal.RulesConfig,
		Status:       StatusConfigProposed,
	})
	configRoom.GameType = proposal.GameType
	configRoom.MoveDuration = proposal.MoveDuration
	configRoom.GameDuration = proposal.GameDuration
	configRoom.FirstPlayer = proposal.FirstPlayer
	configRoom.RulesConfig = proposal.RulesConfig
	configRoom.Status = StatusConfigProposed
	return wrapError("Propose", result.Error)
}

func (s *GORMStore) setStatus(configRoom *ConfigRoom, status Status) error {
	result := s.db.Model(configRoom).Updates(ConfigRoom{
		Status: status,
	})
	configRoom.Status = status
	return wrapError("SetStatus", result.Error)
}

func (s *GORMStore) ReviewConfig(configRoom *ConfigRoom) error {
	return s.setStatus(configRoom, StatusCreated)
}

func (s *GORMStore) StartConfigRoom(configRoom *ConfigRoom) error {
	return s.setStatus(configRoom, StatusStarted)
}

func (s *GORMStore) FinishConfigRoom(configRoom *ConfigRoom) error {
	return s.setStatus(configRoom, StatusFinished)
}

func (s *GORMStore) CreateRematch(configRoom *ConfigRoom, creator MinimalUser, game *Game) (*ConfigRoom, error) {
	// Get the new elo of the creator of the rematch
	creatorElo, err := s.GetElo(configRoom.GameName, creator)
	if err != nil {
		return nil, wrapError("CreateRematchConfigRoom", err)
	}

	// Compute who is the new opponent and who plays first
	var firstPlayer FirstPlayer
	var chosenOpponent MinimalUser
	if game.PlayerZero.ID == creator.ID {
		firstPlayer = FirstPlayerChosenOpponent
		chosenOpponent = game.PlayerOne
	} else {
		firstPlayer = FirstPlayerCreator
		chosenOpponent = game.PlayerZero
	}

	// Get the new elo of the opponent
	chosenOpponentElo, err := s.GetElo(configRoom.GameName, chosenOpponent)
	if err != nil {
		return nil, wrapError("CreateRematchConfigRoom", err)
	}

	// Create the config room for the rematch, as every game needs an associated config room
	rematchConfigRoom := ConfigRoom{
		Creator:           creator,
		CreatorElo:        creatorElo.CurrentElo,
		FirstPlayer:       firstPlayer,
		ChosenOpponent:    &chosenOpponent,
		ChosenOpponentElo: &chosenOpponentElo.CurrentElo,
		Status:            StatusStarted,
		GameType:          configRoom.GameType,
		MoveDuration:      configRoom.MoveDuration,
		GameDuration:      configRoom.GameDuration,
		RulesConfig:       configRoom.RulesConfig,
		GameName:          configRoom.GameName,
	}
	result := s.db.Create(&rematchConfigRoom)
	return &rematchConfigRoom, wrapError("CreateRematchConfigRoom", result.Error)
}

func applyToQueryResult[T any](db *gorm.DB, result *gorm.DB, action func(T) error) error {
	rows, err := result.Rows()
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var element T
		err := db.ScanRows(rows, &element)
		if err != nil {
			return err
		}

		err = action(element)
		if err != nil {
			return err
		}
	}

	return rows.Err()
}

func (s *GORMStore) ApplyToConfigRooms(action func(ConfigRoom) error) error {
	result := s.db.Model(&ConfigRoom{}).Where("status != ?", StatusFinished)
	return wrapError("ApplyToConfigRooms", applyToQueryResult(s.db, result, action))
}

func (s *GORMStore) AddCandidate(configRoom *ConfigRoom, user MinimalUser, elo float64) error {
	result := s.db.Create(&Candidate{
		GameID: configRoom.ID,
		User:   user,
		Elo:    elo,
	})
	return wrapError("AddCandidate", result.Error)
}

func (s *GORMStore) DeleteCandidate(configRoom *ConfigRoom, uid string) error {
	result := s.db.Where("game_id = ? and user_id = ?", configRoom.ID, uid).Delete(&Candidate{})
	return wrapError("DeleteCandidate", result.Error)
}

func (s *GORMStore) ApplyToCandidates(gameId GameID, action func(Candidate) error) error {
	result := s.db.Model(&Candidate{}).Where("game_id = ?", gameId)
	return wrapError("ApplyToCandidates", applyToQueryResult(s.db, result, action))
}

func (s *GORMStore) GetGame(gameId GameID) (*Game, error) {
	var game Game
	result := s.db.First(&game, "game_id = ?", gameId)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &game, wrapError("GetGame", result.Error)
}

func (s *GORMStore) CreateGame(configRoom *ConfigRoom, now int64, randBool bool) (*Game, error) {
	if configRoom.ChosenOpponent == nil {
		return nil, fmt.Errorf("cannot create a game if a config room has no opponent")
	}

	starter := configRoom.FirstPlayer
	if starter == FirstPlayerRandom {
		if randBool {
			starter = FirstPlayerCreator
		} else {
			starter = FirstPlayerChosenOpponent
		}
	}

	var playerZero MinimalUser
	var playerZeroElo float64
	var playerOne MinimalUser
	var playerOneElo float64
	if starter == FirstPlayerCreator {
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

	game := Game{
		GameID:        configRoom.ID,
		GameName:      configRoom.GameName,
		PlayerZero:    playerZero,
		PlayerZeroElo: playerZeroElo,
		PlayerOne:     playerOne,
		PlayerOneElo:  playerOneElo,
		Result:        ResultInProgress,
		Beginning:     now,
	}
	result := s.db.Create(&game)
	return &game, wrapError("CreateGame", result.Error)
}

func (s *GORMStore) SetGameResult(game *Game, gameResult Result) error {
	result := s.db.Model(game).Updates(Game{
		Result: gameResult,
	})
	game.Result = gameResult
	return wrapError("SetResult", result.Error)
}

func (s *GORMStore) AddEvent(gameId GameID, event *GameEvent) error {
	event.GameID = gameId
	result := s.db.Create(event)
	return wrapError("AddEvent", result.Error)
}

func (s *GORMStore) ApplyToGameEvents(gameId GameID, action func(*GameEvent) error) error {
	result := s.db.Model(&GameEvent{}).Where("game_id = ?", gameId).Order("timestamp ASC")
	return wrapError("ApplyToGameEvents", applyToQueryResult(s.db, result, action))
}

func (s *GORMStore) GetElo(gameName string, user MinimalUser) (*Elo, error) {
	entry := Elo{UserID: user.ID, UserName: user.Name, GameName: gameName}
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

// Internal function to update Elo within a transaction
func updateElo(tx *gorm.DB, gameName string, user MinimalUser, elo Elo) error {
	result := tx.Model(&Elo{}).Where("game_name = ? and user_id = ?", gameName, user.ID).Updates(elo)
	return wrapError("UpdateElo", result.Error)
}

func (s *GORMStore) GetElos(gameName string, winner MinimalUser, loser MinimalUser) (*Elo, *Elo, error) {
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

func (s *GORMStore) UpdateElos(gameName string, winner MinimalUser, winnerElo Elo, loser MinimalUser, loserElo Elo) error {
	if err := updateElo(s.db, gameName, winner, winnerElo); err != nil {
		return wrapError("UpdateElos", err)
	}
	if err := updateElo(s.db, gameName, loser, loserElo); err != nil {
		return wrapError("UpdateElos", err)
	}
	return nil
}

func (s *GORMStore) GetCurrentGame(user MinimalUser) (*CurrentGame, error) {
	var currentGame CurrentGame
	result := s.db.Model(&CurrentGame{}).Where("user_id = ?", user.ID).First(&currentGame)
	if result.RowsAffected == 0 {
		return nil, nil // No current game
	}
	return &currentGame, wrapError("GetCurrentGame", result.Error)
}

func (s *GORMStore) SetCurrentGame(currentGame *CurrentGame) error {
	result := s.db.Create(currentGame)
	if errors.Is(result.Error, gorm.ErrDuplicatedKey) {
		return ErrorAlreadySubscribed
	}
	return wrapError("SetCurrentGame", result.Error)
}

// Update the current game of an user. Different from SetCurrentGame which sets
// it initially, here we change e.g., the opponent displayed
func (s *GORMStore) UpdateCurrentGame(user MinimalUser, currentGame *CurrentGame) error {
	var opponentID any
	var opponentName any
	if currentGame.Opponent != nil {
		opponentID = currentGame.Opponent.ID
		opponentName = currentGame.Opponent.Name
	}
	result := s.db.Model(&CurrentGame{}).Where("user_id = ?", user.ID).Updates(map[string]any{
		"user_name":     currentGame.UserName,
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

func (s *GORMStore) RemoveCurrentGame(user MinimalUser) error {
	result := s.db.Model(&CurrentGame{}).Where("user_id = ?", user.ID).Delete(&CurrentGame{})
	return wrapError("RemoveCurrentGame", result.Error)
}

func (s *GORMStore) AddChatMessage(gameId GameID, message *Message) error {
	message.GameID = gameId
	result := s.db.Create(message)
	return wrapError("AddChatMessage", result.Error)
}

func (s *GORMStore) ApplyToMessagesOfGame(gameId GameID, action func(*Message) error) error {
	result := s.db.Model(&Message{}).Where("game_id = ?", gameId).Order("timestamp ASC")
	return wrapError("ApplyToMessagesOfGame", applyToQueryResult(s.db, result, action))
}

func (s *GORMStore) ApplyToObservers(gameId GameID, action func(MinimalUser) error) error {
	result := s.db.Model(&CurrentGame{}).Where("game_id = ? and role = 'Observer'", gameId)
	return wrapError("ApplyToObservers", applyToQueryResult(s.db, result, func(currentGame CurrentGame) error {
		return action(currentGame.GetUser())
	}))
}
