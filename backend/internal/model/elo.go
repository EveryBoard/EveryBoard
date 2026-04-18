package model

type Elo struct {
	ID          uint64      `gorm:"primaryKey;autoincrement" json:"-"`
	User        MinimalUser `gorm:"embedded;embeddedPrefix:user_;not null" json:"-"`
	GameName    string      `gorm:"not null" json:"-"`
	CurrentElo  float64     `gorm:"not null" json:"currentElo"`
	GamesPlayed uint        `goorm:"not null" json:"gamesPlayed"`
}

var EloRows = []string{
	"id",
	"user_id", "user_name",
	"game_name",
	"current_elo",
	"games_played",
}
