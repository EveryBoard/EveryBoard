package model

import (
	"fmt"
	"errors"
	"log"

	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/driver/sqlite"
)

// The connection to the db itself
var db *gorm.DB

func wrapError(ctx string, err error) error {
    if err == nil {
        return nil
    }
    return fmt.Errorf("error in %s: %w", ctx, err)
}


func InitDatabase(dbPath string) {
	var err error

	db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent), // we will log errors ourselves
	})
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}

	err = db.AutoMigrate(&ConfigRoom{})
	if err != nil {
		log.Fatalf("Cannot initialize DB: %v", err)
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
			log.Fatalf("Cannot initialize DB: %v", err)
		}
	}

	err = db.AutoMigrate(&Message{})
	if err != nil {
		log.Fatalf("Cannot initialize DB: %v", err)
	}

	err = db.AutoMigrate(&Elo{})
	if err != nil {
		log.Fatalf("Cannot initialize DB: %v", err)
	}

	err = db.AutoMigrate(&Candidate{})
	if err != nil {
		log.Fatalf("Cannot initialize DB: %v", err)
	}

	err = db.AutoMigrate(&Game{})
	if err != nil {
		log.Fatalf("Cannot initialize DB: %v", err)
	}

	err = db.AutoMigrate(&GameEvent{})
	if err != nil {
		log.Fatalf("Cannot initialize DB: %v", err)
	}

	err = db.AutoMigrate(&CurrentGame{})
	if err != nil {
		log.Fatalf("Cannot initialize DB: %v", err)
	}
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

func GetConfigRoom(gameId GameID) (*ConfigRoom, error) {
	var configRoom ConfigRoom
	result := db.First(&configRoom, "id = ?", gameId)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &configRoom, wrapError("GetConfigRoom", result.Error)
}

func DeleteConfigRoom(configRoom ConfigRoom) error {
	result := db.Model(&ConfigRoom{}).Delete(&configRoom)
	return wrapError("DeleteConfigRoom", result.Error)
}

func GetGame(gameId GameID) (*Game, error) {
	var game Game
	result := db.First(&game, "game_id = ?", gameId)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &game, wrapError("GetGame", result.Error)
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
	log.Println("Created config room", configRoom.ID)

	result := db.Create(&configRoom)
	return &configRoom, wrapError("CreateConfigRoom", result.Error)
}

func CreateRematchConfigRoom(creator MinimalUser, configRoom ConfigRoom, game Game) (*ConfigRoom, error) {
	creatorElo, err := GetElo(configRoom.GameName, creator)
	if err != nil {
		return nil, wrapError("CreateRematchConfigRoom", err)
	}

	var firstPlayer FirstPlayer
	var chosenOpponent MinimalUser
	if game.PlayerZero.ID == creator.ID {
		firstPlayer = FirstPlayerChosenPlayer
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


func (configRoom *ConfigRoom) SelectOpponent(opponent MinimalUser) error {
	result := db.Model(configRoom).Updates(ConfigRoom{ChosenOpponent: &opponent})
	configRoom.ChosenOpponent = &opponent
	return wrapError("SelectOpponent", result.Error)
}

func (configRoom *ConfigRoom) RemoveOpponent() error {
	result := db.Model(configRoom).Updates(ConfigRoom{ChosenOpponent: nil})
	configRoom.ChosenOpponent = nil
	return wrapError("RemoveOpponent", result.Error)
}

func (configRoom *ConfigRoom) Propose(proposal *ConfigProposal) error {
	result := db.Model(configRoom).Updates(ConfigRoom{
		GameType: proposal.GameType,
		MoveDuration: proposal.MoveDuration,
		GameDuration: proposal.GameDuration,
		FirstPlayer: proposal.FirstPlayer,
		RulesConfig: proposal.RulesConfig,
		Status: StatusConfigProposed,
	})
	return wrapError("Propose", result.Error)
}

func (configRoom *ConfigRoom) SetStatus(status Status) error {
	result := db.Model(configRoom).Updates(ConfigRoom{
		Status: status,
	})
	return wrapError("SetStatus", result.Error)
}

func (configRoom *ConfigRoom) Review() error {
	return configRoom.SetStatus(StatusCreated)
}

func (configRoom *ConfigRoom) Start() error {
	return configRoom.SetStatus(StatusStarted)
}

func (configRoom *ConfigRoom) Finish() error {
	return configRoom.SetStatus(StatusFinished)
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

func ApplyToConfigRooms(action func(ConfigRoom) error) error {
	query := db.Model(&ConfigRoom{}).Where("status != ?", StatusFinished)
	return wrapError("ApplyToConfigRooms", ApplyToQueryResult(query, action))
}

func AddChatMessage(gameId GameID, message *Message) error {
	message.GameID = gameId
	result := db.Create(message)
	return wrapError("AddChatMessage", result.Error)
}

func ApplyToMessagesOfGame(gameId GameID, action func(*Message) error) error {
	query := db.Model(&Message{}).Where("game_id = ?", gameId)
	return wrapError("ApplyToMessagesOfGame", ApplyToQueryResult(query, action))
}

func ApplyToGameEvents(gameId GameID, action func(*GameEvent) error) error {
	query := db.Model(&GameEvent{}).Where("game_id = ?", gameId)
	return wrapError("ApplyToGameEvents", ApplyToQueryResult(query, action))
}

func (cr *ConfigRoom) AddCandidate(user MinimalUser) error {
	result := db.Create(&Candidate{
		GameID: cr.ID,
		User: user,
	})
	return wrapError("AddCandidate", result.Error)

}

func (cr *ConfigRoom) DeleteCandidate(uid string) error {
	result := db.Where("game_id = ? and user_id = ?", cr.ID, uid).Delete(&Candidate{})
	return wrapError("DeleteCandidate", result.Error)
}

func ApplyToCandidates(gameId GameID, action func(Candidate) error) error {
	query := db.Model(&Candidate{}).Where("game_id = ?", gameId)
	return wrapError("ApplyToCandidates", ApplyToQueryResult(query, action))
}

func (cr *ConfigRoom) CreateGame(now int64, rand_bool bool) (*Game, error) {
	starter := cr.FirstPlayer
	if starter == FirstPlayerRandom {
		if rand_bool {
			starter = FirstPlayerCreator
		} else {
			starter = FirstPlayerChosenPlayer
		}
	}

	var playerZero MinimalUser
	var playerOne MinimalUser
	if starter == FirstPlayerCreator {
		playerZero = cr.Creator
		playerOne = *cr.ChosenOpponent
	} else {
		playerZero = *cr.ChosenOpponent
		playerOne = cr.Creator
	}

	game := Game{
		GameID: cr.ID,
		GameName: cr.GameName,
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

func UpdateElo(tx *gorm.DB, gameName string, user MinimalUser, elo Elo) error {
	result := tx.Model(&Elo{}).Where("game_name = ? and user_id = ?", gameName, user.ID).Updates(elo)
	return wrapError("UpdateElo", result.Error)
}

func GetElos(gameName string, winner MinimalUser, loser MinimalUser) (*Elo, *Elo, error) {
	// TODO: do this through a transaction
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
	err := UpdateElo(tx, gameName, winner, winnerElo)
	if err != nil {
		tx.Rollback()
		return wrapError("UpdateElos", err)
	}
	err = UpdateElo(tx, gameName, loser, loserElo)
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

func UpdateCurrentGame(user MinimalUser, currentGame CurrentGame) error {
	result := db.Model(&CurrentGame{}).Where("user_id = ?", user.ID).Updates(currentGame)
	return wrapError("UpdateCurrentGame", result.Error)
}

func RemoveCurrentGame(user MinimalUser) error {
	result := db.Model(&CurrentGame{}).Where("user_id = ?", user.ID).Delete(&CurrentGame{})
	return wrapError("RemoveCurrentGame", result.Error)
}

func ApplyToObservers(gameId GameID, action func(MinimalUser) error) error {
	query := db.Model(&CurrentGame{}).Where("game_id = ? and role = 'Observer'", StatusFinished)
	return wrapError("ApplyToObservers", ApplyToQueryResult(query, action))
}
