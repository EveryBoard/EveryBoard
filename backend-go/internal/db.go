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
		log.Fatal("Cannot initialize DB: %v", err)
	}

	err = db.AutoMigrate(&Elo{})
	if err != nil {
		log.Fatal("Cannot initialize DB: %v", err)
	}

	err = db.AutoMigrate(&Candidate{})
	if err != nil {
		log.Fatal("Cannot initialize DB: %v", err)
	}
}

func GetElo(user *MinimalUser, gameName string) (*Elo, error) {
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

func CreateConfigRoom(creator *MinimalUser, gameName string) (*ConfigRoom, error) {
	log.Println("CreateConfigRoom")
	creatorElo, error := GetElo(creator, gameName)
	if error != nil {
		return nil, error
	}
	log.Println("CreateConfigRoom: after elo")
	configRoom := ConfigRoom{
		Creator: *creator,
		CreatorElo: creatorElo.CurrentElo,
		FirstPlayer: FirstPlayerRandom,
		ChosenOpponent: nil,
		Status: StatusCreated,
		GameType: GameTypeStandard,
		MaximalMoveDuration: StandardMoveDuration,
		TotalGameDuration: StandardGameDuration,
		RulesConfig: nil,
		GameName: gameName,
	}

	result := db.Create(&configRoom)
	return &configRoom, result.Error
}

func DeleteConfigRoom(gameId GameID) error {
	return db.Where("id = ?", gameId).Delete(&ConfigRoom{}).Error
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

func AddCandidate(gameId GameID, user *MinimalUser) error {
	result := db.Create(&Candidate{
		GameID: gameId,
		User: *user,
	})
	return result.Error

}

func DeleteCandidate(gameId GameID, uid string) error {
	return db.Where("game_id = ? and user_id = ?", gameId, uid).Delete(&ConfigRoom{}).Error
}

func ApplyToCandidates(gameId GameID, action func(*Candidate) error) error {
	query := db.Model(&Candidate{}).Where("game_id = ?", gameId)
	return ApplyToQueryResult(query, action)
}
