package model

type MinimalUser struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	IsBot       bool   `json:"-"`
}

type UserRole string

const (
	UserRolePlayer         UserRole = "Player"
	UserRoleObserver       UserRole = "Observer"
	UserRoleCreator        UserRole = "Creator"
	UserRoleChosenOpponent UserRole = "ChosenOpponent"
	UserRoleCandidate      UserRole = "Candidate"
)

// When a player plays or observes a game, they have a current game
// We could think that we can just deduce that from the ConfigRoom table.
// But actually, we need this for observers, as this is the only place where this information is stored.
// (Maybe we could deduce this from the internal data of the backend though)
type CurrentGame struct {
	ID       uint         `gorm:"primaryKey;autoIncrement;autoIncrementIncrement:1" json:"-"`
	UserID   string       `gorm:"column:user_id;uniqueIndex;not null" json:"-"`
	UserName string       `gorm:"column:user_name;not null" json:"-"`
	GameID   GameID       `gorm:"index;not null;foreignKey:ConfigRoom" json:"id"`
	GameName string       `gorm:"not null" json:"gameName"`
	Creator  MinimalUser  `gorm:"embedded;embeddedPrefix:creator_;not null" json:"creator"`
	Opponent *MinimalUser `gorm:"embedded;embeddedPrefix:opponent_" json:"opponent"`
	Role     UserRole     `gorm:"not null" json:"role"`
}

func (cg CurrentGame) GetUser() MinimalUser {
	return MinimalUser{ID: cg.UserID, Name: cg.UserName}
}

var CurrentGameRows = []string{"id", "user_id", "user_name", "game_id", "game_name", "creator_id", "creator_name", "opponent_id", "opponent_name", "role"}
