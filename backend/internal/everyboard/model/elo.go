package model

type Elo struct {
	ID          uint64  `gorm:"primaryKey;autoincrement" json:"-"`
	UserID      string  `gorm:"column:user_id;not null;uniqueIndex:idx_user_gamename" json:"-"`
	UserName    string  `gorm:"column:user_name;not null" json:"-"`
	GameName    string  `gorm:"not null;uniqueIndex:idx_user_gamename" json:"-"`
	CurrentElo  float64 `gorm:"not null" json:"currentElo"`
	GamesPlayed uint    `gorm:"not null" json:"gamesPlayed"`
}

var EloRows = []string{
	"id",
	"user_id", "user_name",
	"game_name",
	"current_elo",
	"games_played",
}
