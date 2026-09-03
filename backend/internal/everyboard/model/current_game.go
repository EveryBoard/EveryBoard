package model

type UserRole string

const (
	UserRolePlayer         UserRole = "Player"
	UserRoleObserver       UserRole = "Observer"
	UserRoleCreator        UserRole = "Creator"
	UserRoleChosenOpponent UserRole = "ChosenOpponent"
	UserRoleCandidate      UserRole = "Candidate"
)

// A CurrentGame represents the fact that a player plays or observes a game.
// We could think that we can just deduce that from the ConfigRoom table.
// But actually, we need this for observers, as this is the only place where this information is stored.
// (Maybe we could deduce this from the internal data of the backend though)
type CurrentGame struct {
	ID       uint         `gorm:"primaryKey;autoIncrement;autoIncrementIncrement:1" json:"-"`
	User     MinimalUser  `gorm:"embedded;embeddedPrefix:user_;not null" json:"-"`
	GameID   GameID       `gorm:"index;not null;foreignKey:ConfigRoom" json:"id"`
	GameName string       `gorm:"not null" json:"gameName"`
	Creator  MinimalUser  `gorm:"embedded;embeddedPrefix:creator_;not null" json:"creator"`
	Opponent *MinimalUser `gorm:"embedded;embeddedPrefix:opponent_" json:"opponent"`
	Role     UserRole     `gorm:"not null" json:"role"`
}
