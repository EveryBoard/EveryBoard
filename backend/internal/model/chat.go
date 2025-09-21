package model

type Message struct {
	ID        uint64      `gorm:"primaryKey;autoIncrement;type:bigserial" json:"-"`
	GameID    GameID      `gorm:"index;not null;foreignKey:ConfigRoom" json:"-"`
	Sender    MinimalUser `gorm:"embedded;embeddedPrefix:sender_;not null" json:"sender"`
	Timestamp int64       `gorm:"not null" json:"timestamp"`
	Content   string      `gorm:"not null" json:"content"`
}
