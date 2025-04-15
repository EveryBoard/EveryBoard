package internal

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type DBChatMessage struct {
	ID         uint64 `gorm:"primaryKey;autoIncrement"`
	GameID     uint64 `gorm:"index;not null"`
	AuthorID   string `gorm:"not null"`
	AuthorName string `gorm:"not null"`
	Timestamp  int64  `gorm:"not null"`
	Content    string `gorm:"not null"`
}

func (this *DBChatMessage) ToMessage() *Message {
	return &Message{
		Sender:    MinimalUser{Id: this.AuthorID, Name: this.AuthorName},
		Timestamp: this.Timestamp,
		Content:   this.Content,
	}
}

// The connection to the db itself
var db *gorm.DB

func InitDatabase(dbPath string) {
	var err error

	db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}

	db.AutoMigrate(&DBChatMessage{})
}

func AddChatMessage(gameId string, message *Message) error {
	id, err := DecodeId(gameId)
	if err != nil {
		return err
	}

	result := db.Create(&DBChatMessage{
		GameID:     id,
		AuthorID:   message.Sender.Id,
		AuthorName: message.Sender.Name,
		Timestamp:  message.Timestamp,
		Content:    message.Content,
	})
	return result.Error
}

func ApplyToMessagesOfGame(gameId string, action func(*Message)) error {
	id, err := DecodeId(gameId)
	if err != nil {
		return err
	}

	rows, err := db.Model(&DBChatMessage{}).Where("game_id = ?", id).Rows()
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var message DBChatMessage
		err := db.ScanRows(rows, &message)
		if err != nil {
			return err
		}

		// Apply the action to the message
		action(message.ToMessage())
	}

	err = rows.Err()
	if err != nil {
		return err
	}

	return nil
}
