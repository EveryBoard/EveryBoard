package model

import (
	"fmt"
	"errors"
	"log"

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

	err = db.AutoMigrate(&ConfigRoom{})
	if err != nil {
		return fmt.Errorf("Cannot initialize DB: %v", err)
	}

	// Create first config room, which is actually the lobby
	var lobby ConfigRoom
	result := db.First(&lobby, "id = ?", GameIDLobby)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		lobby = ConfigRoom{
			ID: GameIDLobby,
			Creator: MinimalUser{ Name: "", ID: "" },
			CreatorElo: 0,
			Status: StatusFinished,
			FirstPlayer: FirstPlayerRandom,
			GameType: GameTypeStandard,
			RulesConfig: nil,
			GameName: "lobby",
		}
		result := db.Create(&lobby)
		if result.Error != nil {
			return fmt.Errorf("Cannot initialize DB: %v", err)
		}
	}

	log.Println("creating message table")
	err = db.AutoMigrate(&Message{})
	if err != nil {
		return fmt.Errorf("Cannot initialize DB: %v", err)
	}

	err = db.AutoMigrate(&Elo{})
	if err != nil {
		return fmt.Errorf("Cannot initialize DB: %v", err)
	}

	err = db.AutoMigrate(&Candidate{})
	if err != nil {
		return fmt.Errorf("Cannot initialize DB: %v", err)
	}

	err = db.AutoMigrate(&Game{})
	if err != nil {
		return fmt.Errorf("Cannot initialize DB: %v", err)
	}

	err = db.AutoMigrate(&GameEvent{})
	if err != nil {
		return fmt.Errorf("Cannot initialize DB: %v", err)
	}

	err = db.AutoMigrate(&CurrentGame{})
	if err != nil {
		return fmt.Errorf("Cannot initialize DB: %v", err)
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
		Creator: creator,
		CreatorElo: creatorElo.CurrentElo,
		FirstPlayer: FirstPlayerRandom,
		ChosenOpponent: nil,
		Status: StatusCreated,
		GameType: GameTypeStandard,
		MoveDuration: StandardMoveDuration,
		GameDuration: StandardGameDuration,
		RulesConfig: nil,
		GameName: gameName,
	}

	result := db.Create(&configRoom)
	log.Println("Created config room", configRoom.ID)
	return &configRoom, wrapError("CreateConfigRoom", result.Error)
}

func (configRoom ConfigRoom) Delete() error {
	result := db.Model(&ConfigRoom{}).Delete(&configRoom)
	return wrapError("DeleteConfigRoom", result.Error)
}

func (configRoom *ConfigRoom) SelectOpponent(opponent MinimalUser) error {
	result := db.Model(configRoom).Updates(ConfigRoom{ChosenOpponent: &opponent})
	configRoom.ChosenOpponent = &opponent
	return wrapError("SelectOpponent", result.Error)
}

func (configRoom *ConfigRoom) RemoveOpponent() error {
	// A bit ugly because setting ChosenOpponent to nil will make gorm ignore this field...
	result := db.Model(configRoom).Updates(map[string]interface{}{
		"chosen_opponent_id": nil,
		"chosen_opponent_name": nil,
	})
	configRoom.ChosenOpponent = nil
	return wrapError("RemoveOpponent", result.Error)
}

func (configRoom *ConfigRoom) Propose(proposal ConfigProposal) error {
	result := db.Model(configRoom).Updates(ConfigRoom{
		GameType: proposal.GameType,
		MoveDuration: proposal.MoveDuration,
		GameDuration: proposal.GameDuration,
		FirstPlayer: proposal.FirstPlayer,
		RulesConfig: proposal.RulesConfig,
		Status: StatusConfigProposed,
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
	creatorElo, err := GetElo(configRoom.GameName, creator)
	if err != nil {
		return nil, wrapError("CreateRematchConfigRoom", err)
	}

	var firstPlayer FirstPlayer
	var chosenOpponent MinimalUser
	if game.PlayerZero.ID == creator.ID {
		firstPlayer = FirstPlayerChosenOpponent
		chosenOpponent = game.PlayerOne
	} else {
		firstPlayer = FirstPlayerCreator
		chosenOpponent = game.PlayerZero
	}

	rematchConfigRoom := ConfigRoom{
		Creator: creator,
		CreatorElo: creatorElo.CurrentElo,
		FirstPlayer: firstPlayer,
		ChosenOpponent: &chosenOpponent,
		Status: StatusStarted,
		GameType: configRoom.GameType,
		MoveDuration: configRoom.MoveDuration,
		GameDuration: configRoom.GameDuration,
		RulesConfig: configRoom.RulesConfig,
		GameName: configRoom.GameName,
	}

	result := db.Create(&rematchConfigRoom)
	return &rematchConfigRoom, wrapError("CreateRematchConfigRoom", result.Error)
}

func ApplyToConfigRooms(action func(ConfigRoom) error) error {
	query := db.Model(&ConfigRoom{}).Where("status != ?", StatusFinished)
	return wrapError("ApplyToConfigRooms", ApplyToQueryResult(query, action))
}

func (configRoom ConfigRoom) AddCandidate(user MinimalUser) error {
	result := db.Create(&Candidate{
		GameID: configRoom.ID,
		User: user,
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
	var playerOne MinimalUser
	if starter == FirstPlayerCreator {
		playerZero = configRoom.Creator
		playerOne = *configRoom.ChosenOpponent
	} else {
		playerZero = *configRoom.ChosenOpponent
		playerOne = configRoom.Creator
	}

	game := Game{
		GameID: configRoom.ID,
		GameName: configRoom.GameName,
		PlayerZero: playerZero,
		PlayerOne: playerOne,
		Result: ResultInProgress,
		Beginning: now,
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
			User: user,
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

func SetCurrentGame(user MinimalUser, currentGame CurrentGame) error {
	currentGame.UserID = user.ID
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
	return wrapError("ApplyToObservers", ApplyToQueryResult(query, action))
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
