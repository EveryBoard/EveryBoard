package model

import (
	"errors"
	"fmt"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// The connection to the db itself
var db *gorm.DB

func wrapError(ctx string, err error) error {
	if err == nil {
		return nil
	}
	return fmt.Errorf("error in %s: %w", ctx, err)
}

// Initialize the database given a dialector, which will either be in-memory
// SQLite for testing (sqlite.Open(":memory:")) or another DB for production (e.g., postgres.Open("some-dsn").)
func InitDatabase(dialector gorm.Dialector) error {
	var err error

	db, err = gorm.Open(dialector, &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent), // we will log errors ourselves
	})
	if err != nil {
		return fmt.Errorf("Failed to connect to DB: %v", err)
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
		return fmt.Errorf("Cannot initialize DB (AutoMigrate ConfigRoom): %v", err)
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
			return fmt.Errorf("Cannot initialize DB (Create lobby): %v", err)
		}
	}

	err = db.AutoMigrate(&Message{})
	if err != nil {
		return fmt.Errorf("Cannot initialize DB (AutoMigrate Message): %v", err)
	}

	err = db.AutoMigrate(&Elo{})
	if err != nil {
		return fmt.Errorf("Cannot initialize DB (AutoMigrate Elo): %v", err)
	}

	err = db.AutoMigrate(&Candidate{})
	if err != nil {
		return fmt.Errorf("Cannot initialize DB (AutoMigrate Candidate): %v", err)
	}

	err = db.AutoMigrate(&Game{})
	if err != nil {
		return fmt.Errorf("Cannot initialize DB (AutoMigrate Game): %v", err)
	}

	err = db.AutoMigrate(&GameEvent{})
	if err != nil {
		return fmt.Errorf("Cannot initialize DB (AutoMigrate GameEvent): %v", err)
	}

	err = db.AutoMigrate(&CurrentGame{})
	if err != nil {
		return fmt.Errorf("Cannot initialize DB: %v (AutoMigrate CurrentGame)", err)
	}
	return nil
}

func GetConfigRoom(gameId GameID) (*ConfigRoom, error) {
	var configRoom ConfigRoom
	result := db.First(&configRoom, "id = ?", gameId)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &configRoom, wrapError("GetConfigRoom", result.Error)
}

func CreateConfigRoom(creator MinimalUser, gameName string) (*ConfigRoom, error) {
	creatorElo, error := GetElo(gameName, creator)
	if error != nil {
		return nil, error
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

	result := db.Create(&configRoom)
	return &configRoom, wrapError("CreateConfigRoom", result.Error)
}

func (configRoom ConfigRoom) Delete() error {
	result := db.Model(&ConfigRoom{}).Delete(&configRoom)
	return wrapError("DeleteConfigRoom", result.Error)
}

func (configRoom *ConfigRoom) SelectOpponent(opponent MinimalUser) error {
	var candidateElo float64
	result := db.Model(&Candidate{}).
		Select("elo").
		Where("game_id = ? AND user_id = ?", configRoom.ID, opponent.ID).
		Scan(&candidateElo)
	if result.Error != nil {
		return wrapError("SelectOpponent", result.Error)
	}
	result = db.Model(&ConfigRoom{}).Where("id = ?", configRoom.ID).Updates(ConfigRoom{ChosenOpponent: &opponent, ChosenOpponentElo: &candidateElo})
	if result.Error != nil {
		return wrapError("SelectOpponent", result.Error)
	}
	configRoom.ChosenOpponent = &opponent
	configRoom.ChosenOpponentElo = &candidateElo
	return result.Error
}

func (configRoom *ConfigRoom) RemoveOpponent() error {
	// A bit ugly because setting ChosenOpponent to nil will make gorm ignore this field...
	result := db.Model(configRoom).Updates(map[string]interface{}{
		"chosen_opponent_id":   nil,
		"chosen_opponent_name": nil,
		"chosen_opponent_elo":  nil,
	})
	configRoom.ChosenOpponent = nil
	return wrapError("RemoveOpponent", result.Error)
}

func (configRoom *ConfigRoom) Propose(proposal ConfigProposal) error {
	result := db.Model(configRoom).Updates(ConfigRoom{
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

func (configRoom *ConfigRoom) setStatus(status Status) error {
	result := db.Model(configRoom).Updates(ConfigRoom{
		Status: status,
	})
	return wrapError("SetStatus", result.Error)
}

func (configRoom *ConfigRoom) Review() error {
	return configRoom.setStatus(StatusCreated)
}

func (configRoom *ConfigRoom) Start() error {
	return configRoom.setStatus(StatusStarted)
}

func (configRoom *ConfigRoom) Finish() error {
	return configRoom.setStatus(StatusFinished)
}

func (configRoom ConfigRoom) CreateRematch(creator MinimalUser, game Game) (*ConfigRoom, error) {
	// Get the new elo of the creator of the rematch
	creatorElo, err := GetElo(configRoom.GameName, creator)
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
	chosenOpponentElo, err := GetElo(configRoom.GameName, chosenOpponent)
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
	result := db.Create(&rematchConfigRoom)
	return &rematchConfigRoom, wrapError("CreateRematchConfigRoom", result.Error)
}

func ApplyToConfigRooms(action func(ConfigRoom) error) error {
	query := db.Model(&ConfigRoom{}).Where("status != ?", StatusFinished)
	return wrapError("ApplyToConfigRooms", ApplyToQueryResult(query, action))
}

func (configRoom ConfigRoom) AddCandidate(user MinimalUser, elo float64) error {
	result := db.Create(&Candidate{
		GameID: configRoom.ID,
		User:   user,
		Elo:    elo,
	})
	return wrapError("AddCandidate", result.Error)
}

func (configRoom ConfigRoom) DeleteCandidate(uid string) error {
	result := db.Where("game_id = ? and user_id = ?", configRoom.ID, uid).Delete(&Candidate{})
	return wrapError("DeleteCandidate", result.Error)
}

func ApplyToCandidates(gameId GameID, action func(Candidate) error) error {
	query := db.Model(&Candidate{}).Where("game_id = ?", gameId)
	return wrapError("ApplyToCandidates", ApplyToQueryResult(query, action))
}

func GetGame(gameId GameID) (*Game, error) {
	var game Game
	result := db.First(&game, "game_id = ?", gameId)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &game, wrapError("GetGame", result.Error)
}

func (configRoom *ConfigRoom) CreateGame(now int64, rand_bool bool) (*Game, error) {
	if configRoom.ChosenOpponent == nil {
		return nil, fmt.Errorf("cannot create a game if a config room has no opponent")
	}

	starter := configRoom.FirstPlayer
	if starter == FirstPlayerRandom {
		if rand_bool {
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
	result := db.Create(&game)
	return &game, wrapError("CreateGame", result.Error)
}

func (game *Game) SetResult(gameResult Result) error {
	result := db.Model(game).Updates(Game{
		Result: gameResult,
	})
	return wrapError("SetResult", result.Error)
}

func AddEvent(gameId GameID, event GameEvent) error {
	event.GameID = gameId
	result := db.Create(&event)
	return wrapError("AddEvent", result.Error)
}

func ApplyToGameEvents(gameId GameID, action func(*GameEvent) error) error {
	query := db.Model(&GameEvent{}).Where("game_id = ?", gameId).Order("timestamp ASC")
	return wrapError("ApplyToGameEvents", ApplyToQueryResult(query, action))
}

func GetElo(gameName string, user MinimalUser) (*Elo, error) {
	var entry Elo
	result := db.First(&entry, "user_id = ? AND game_name = ?", user.ID, gameName)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		entry = Elo{
			User:     user,
			GameName: gameName,
		}
		result = db.Create(&entry)
	}
	return &entry, wrapError("GetElo", result.Error)
}

// Internal function to update Elo within a transaction
func updateElo(tx *gorm.DB, gameName string, user MinimalUser, elo Elo) error {
	result := tx.Model(&Elo{}).Where("game_name = ? and user_id = ?", gameName, user.ID).Updates(elo)
	return wrapError("UpdateElo", result.Error)
}

func GetElos(gameName string, winner MinimalUser, loser MinimalUser) (*Elo, *Elo, error) {
	eloWinner, err := GetElo(gameName, winner)
	if err != nil {
		return nil, nil, wrapError("GetElos", err)
	}

	eloLoser, err := GetElo(gameName, loser)
	if err != nil {
		return nil, nil, wrapError("GetElos", err)
	}
	return eloWinner, eloLoser, nil
}

func UpdateElos(gameName string, winner MinimalUser, winnerElo Elo, loser MinimalUser, loserElo Elo) error {
	tx := db.Begin()
	err := updateElo(tx, gameName, winner, winnerElo)
	if err != nil {
		tx.Rollback()
		return wrapError("UpdateElos", err)
	}
	err = updateElo(tx, gameName, loser, loserElo)
	if err != nil {
		tx.Rollback()
		return wrapError("UpdateElos", err)
	}
	result := tx.Commit()
	return wrapError("UpdateElos", result.Error)
}

func GetCurrentGame(user MinimalUser) (*CurrentGame, error) {
	var currentGame CurrentGame
	result := db.Model(&CurrentGame{}).Where("user_id = ?", user.ID).First(&currentGame)
	if result.RowsAffected == 0 {
		return nil, nil // No current game
	}
	return &currentGame, wrapError("GetCurrentGame", result.Error)
}

func SetCurrentGame(currentGame CurrentGame) error {
	result := db.Create(&currentGame)
	return wrapError("SetCurrentGame", result.Error)
}

// Update the current game of an user. Different from SetCurrentGame which sets
// it initially, here we change e.g., the opponent displayed
func UpdateCurrentGame(user MinimalUser, currentGame CurrentGame) error {
	result := db.Model(&CurrentGame{}).Where("user_id = ?", user.ID).Updates(currentGame)
	return wrapError("UpdateCurrentGame", result.Error)
}

func RemoveCurrentGame(user MinimalUser) error {
	result := db.Model(&CurrentGame{}).Where("user_id = ?", user.ID).Delete(&CurrentGame{})
	return wrapError("RemoveCurrentGame", result.Error)
}

func ApplyToQueryResult[T interface{}](tx *gorm.DB, action func(T) error) error {
	rows, err := tx.Rows()
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

func ApplyToObservers(gameId GameID, action func(MinimalUser) error) error {
	query := db.Model(&CurrentGame{}).Where("game_id = ? and role = 'Observer'", gameId)
	return wrapError("ApplyToObservers", ApplyToQueryResult(query, func(currentGame CurrentGame) error {
		return action(currentGame.User)
	}))
}

func AddChatMessage(gameId GameID, message *Message) error {
	message.GameID = gameId
	result := db.Create(message)
	return wrapError("AddChatMessage", result.Error)
}

func ApplyToMessagesOfGame(gameId GameID, action func(*Message) error) error {
	query := db.Model(&Message{}).Where("game_id = ?", gameId).Order("timestamp ASC")
	return wrapError("ApplyToMessagesOfGame", ApplyToQueryResult(query, action))
}
