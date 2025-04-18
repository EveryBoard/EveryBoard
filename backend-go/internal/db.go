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
}

func GetElo(user *MinimalUser, gameName string) (*Elo, error) {
	var entry *Elo
	result := db.First(entry, "user = ? AND game_name = ?", user, gameName)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		entry = &Elo{
			User: *user,
			GameName: gameName,
		}
		result = db.Create(entry)
	}

	return entry, result.Error
}

func CreateConfigRoom(creator *MinimalUser, gameName string) (*ConfigRoom, error) {
	creatorElo, error := GetElo(creator, gameName)
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
		MaximalMoveDuration: StandardMoveDuration,
		TotalGameDuration: StandardGameDuration,
		RulesConfig: nil,
		GameName: gameName,
	}

	result := db.Create(configRoom)
	return &configRoom, result.Error
}

func AddChatMessage(gameId GameID, message *Message) error {
	message.GameID = gameId
	result := db.Create(message)
	return result.Error
}

func ApplyToMessagesOfGame(gameId string, action func(*Message)) error {
	id, err := DecodeId(gameId)
	if err != nil {
		return err
	}

	rows, err := db.Model(&ChatMessage{}).Where("game_id = ?", id).Rows()
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var message Message
		err := db.ScanRows(rows, &message)
		if err != nil {
			return err
		}

		// Apply the action to the message
		action(&message)
	}

	err = rows.Err()
	if err != nil {
		return err
	}

	return nil
}
