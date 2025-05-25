package model

type MinimalUser struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type UserRole string

const (
	UserRolePlayer         UserRole = "Player"
	UserRoleObserver       UserRole = "Observer"
	UserRoleCreator        UserRole = "Creator"
	UserRoleChosenOpponent UserRole = "ChosenOpponent"
	UserRoleCandidate      UserRole = "Candidate"
)

type CurrentGame struct {
	UserID   string       `gorm:"index;not null" json:"-"`
	GameID   GameID       `gorm:"index;not null;foreignKey:ConfigRoom" json:"id"`
	GameName string       `gorm:"not null" json:"gameName"`
	Opponent *MinimalUser `gorm:"embedded;embeddelPrefix:opponent_" json:"opponent"`
	Role     UserRole     `gorm:"not null" json:"role"`
}
