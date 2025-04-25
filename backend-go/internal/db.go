package internal

import (
	"log"
	"errors"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// The connection to the db itself
var db *gorm.DB

func InitDatabase(dbPath string) {
	var err error

	db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}

	err = db.AutoMigrate(&ConfigRoom{})
	if err != nil {
		log.Fatal("Cannot initialize DB: %v", err)
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
}

func GetElo(gameName string, user *MinimalUser) (*Elo, error) {
	var entry Elo
	result := db.First(&entry, "user_id = ? AND game_name = ?", user.ID, gameName)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		entry = Elo{
			User: *user,
			GameName: gameName,
		}
		result = db.Create(&entry)
	}

	return &entry, result.Error
}

// Retrieve a config room. Returns nil without error if there is none.
func GetConfigRoom(gameId GameID) (*ConfigRoom, error) {
	var configRoom ConfigRoom
	result := db.First(&configRoom, "id = ?", gameId)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &configRoom, result.Error
}

func GetGame(gameId GameID) (*Game, error) {
	var game Game
	result := db.First(&game, "game_id = ?", gameId)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &game, result.Error
}

func CreateConfigRoom(creator *MinimalUser, gameName string) (*ConfigRoom, error) {
	creatorElo, error := GetElo(gameName, creator)
	if error != nil {
		return nil, error
	}

	configRoom := ConfigRoom{
		Creator: *creator,
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
	return &configRoom, result.Error
}

func (cr *ConfigRoom) Delete() error {
	return db.Model(&cr).Delete(&ConfigRoom{}).Error
}

func (cr *ConfigRoom) SelectOpponent(opponent *MinimalUser) error {
	result := db.Model(&cr).Updates(ConfigRoom{ChosenOpponent: opponent})
	return result.Error
}

func (cr *ConfigRoom) Propose(proposal *ConfigProposal) error {
	result := db.Model(&cr).Updates(ConfigRoom{
		GameType: proposal.GameType,
		MoveDuration: proposal.MoveDuration,
		GameDuration: proposal.GameDuration,
		FirstPlayer: proposal.FirstPlayer,
		RulesConfig: proposal.RulesConfig,
		Status: StatusConfigProposed,
	})
	return result.Error
}

func (cr *ConfigRoom) SetStatus(status Status) error {
	result := db.Model(cr).Updates(ConfigRoom{
		Status: status,
	})
	return result.Error
}

func (cr *ConfigRoom) Review() error {
	return cr.SetStatus(StatusCreated)
}

func (cr *ConfigRoom) Start() error {
	return cr.SetStatus(StatusStarted)
}

func (cr *ConfigRoom) Finish() error {
	return cr.SetStatus(StatusFinished)
}

func ApplyToQueryResult[T interface{}](tx *gorm.DB, action func(*T) error) error {
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

		err = action(&element)
		if err != nil {
			return err
		}
	}

	return rows.Err()
}

func ApplyToConfigRooms(action func(*ConfigRoom) error) error {
	query := db.Model(&ConfigRoom{}).Where("status != ?", StatusFinished)
	return ApplyToQueryResult(query, action)
}

func AddChatMessage(gameId GameID, message *Message) error {
	message.GameID = gameId
	result := db.Create(message)
	return result.Error
}

func ApplyToMessagesOfGame(gameId GameID, action func(*Message) error) error {
	query := db.Model(&Message{}).Where("game_id = ?", gameId)
	return ApplyToQueryResult(query, action)
}

func ApplyToGameEvents(gameId GameID, action func(*GameEvent) error) error {
	query := db.Model(&GameEvent{}).Where("game_id = ?", gameId)
	return ApplyToQueryResult(query, action)
}

func (cr *ConfigRoom) AddCandidate(user *MinimalUser) error {
	result := db.Create(&Candidate{
		GameID: cr.ID,
		User: *user,
	})
	return result.Error

}

func (cr *ConfigRoom) DeleteCandidate(uid string) error {
	return db.Where("game_id = ? and user_id = ?", cr.ID, uid).Delete(&Candidate{}).Error
}

func ApplyToCandidates(gameId GameID, action func(*Candidate) error) error {
	query := db.Model(&Candidate{}).Where("game_id = ?", gameId)
	return ApplyToQueryResult(query, action)
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
	return &game, result.Error
}

func (game *Game) SetResult(gameResult Result) error {
	result := db.Model(game).Updates(Game{
		Result: gameResult,
	})
	return result.Error
}

func AddEvent(gameId GameID, event GameEvent) error {
	event.GameID = gameId
	return db.Create(&event).Error
}
