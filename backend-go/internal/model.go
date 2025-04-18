package internal

import (
	"encoding/json"
	"fmt"
)

type MinimalUser struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type Message struct {
	ID        uint64      `gorm:"primaryKey;autoIncrement" json:"-"`
	GameID    GameID      `gorm:"index;not null;foreignKey:ConfigRoom" json:"-"`
	Sender    MinimalUser `gorm:"embedded;embeddedPrefix:sender_;not null" json:"sender"`
	Timestamp int64       `gorm:"not null" json:"timestamp"`
	Content   string      `gorm:"not null" json:"content"`
}

type FirstPlayer string

const (
	FirstPlayerRandom       FirstPlayer = "RANDOM"
	FirstPlayerChosenPlayer FirstPlayer = "CHOSEN_PLAYER"
	FirstPlayerCreator      FirstPlayer = "CREATOR"
)

func (fp *FirstPlayer) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	switch s {
	case "RANDOM", "CHOSEN_PLAYER", "CREATOR":
		*fp = FirstPlayer(s)
		return nil
	default:
		return fmt.Errorf("invalid FirstPlayer: %s", s)
	}
}

type Status string

const (
	StatusCreated        Status = "Created"
	StatusConfigProposed Status = "ConfigProposed"
	StatusStarted        Status = "Started"
	StatusFinished       Status = "Finished"
)

func (status *Status) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	switch s {
	case "Created", "ConfigProposed", "Started", "Finished":
		*status = Status(s)
		return nil
	default:
		return fmt.Errorf("invalid Status: %s", s)
	}
}

type GameType string

const (
	GameTypeStandard GameType = "STANDARD"
	GameTypeBlitz    GameType = "BLITZ"
	GameTypeCustom   GameType = "CUSTOM"
)

const StandardMoveDuration = 2 * 60
const StandardGameDuration = 30 * 60

func (gt *GameType) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	switch s {
	case "STANDARD", "BLITZ", "CUSTOM":
		*gt = GameType(s)
		return nil
	default:
		return fmt.Errorf("invalid Status: %s", s)
	}
}

type Elo struct {
	ID          uint64      `gorm:"primaryKey;autoincrement" json:"-"`
	User        MinimalUser `gorm:"embedded;embeddedPrefix:user_;not null" json:"-"`
	GameName    string      `gorm:"not null" json:"-"`
	CurrentElo  float64     `gorm:"not null" json:"currentElo"`
	GamesPlayed uint        `goorm:"not null" json:"gamesPlayed"`
}

type ConfigRoom struct {
	ID                  GameID       `gorm:"primaryKey;autoIncrement" json:"-"`
	Creator             MinimalUser  `gorm:"embedded;embeddedPrefix:creator_;not null" json:"creator"`
	CreatorElo          float64      `gorm:"not null" json:"creatorElo"`
	ChosenOpponent      *MinimalUser `gorm:"embedded;embeddedPrefix:chosen_opponent_" json:"chosenOpponent,omitempty"`
	Status              Status       `gorm:"not null" json:"partStatus"`
	FirstPlayer         FirstPlayer  `gorm:"not null" json:"firstPlayer"`
	GameType            GameType     `gorm:"not null" json:"partType"`
	MaximalMoveDuration int          `gorm:"not null" json:"maximalMoveDuration"`
	// TODO: rename json to totalGameDuration
	TotalGameDuration int             `gorm:"not null" json:"totalPartDuration"`
	RulesConfig       json.RawMessage `json:"rulesConfig"`
	GameName          string          `gorm:"not null" json:"gameName"`
}

type Candidate struct {
	ID     uint64      `gorm:"primaryKey;autoincrement" json:"-"`
	GameID GameID      `gorm:"index;not null;foreignKey:ConfigRoom" json:"-"`
	User   MinimalUser `gorm:"embedded"`
}
