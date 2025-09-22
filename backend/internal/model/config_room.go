package model

import (
	"encoding/json"
	"fmt"
)

type FirstPlayer string

const (
	FirstPlayerRandom         FirstPlayer = "Random"
	FirstPlayerChosenOpponent FirstPlayer = "ChosenOpponent"
	FirstPlayerCreator        FirstPlayer = "Creator"
)

func (fp *FirstPlayer) UnmarshalJSON(data []byte) error {
	var s string
	err := json.Unmarshal(data, &s)
	if err != nil {
		return err
	}
	switch FirstPlayer(s) {
	case FirstPlayerRandom, FirstPlayerChosenOpponent, FirstPlayerCreator:
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
	err := json.Unmarshal(data, &s)
	if err != nil {
		return err
	}
	switch Status(s) {
	case StatusCreated, StatusConfigProposed, StatusStarted, StatusFinished:
		*status = Status(s)
		return nil
	default:
		return fmt.Errorf("invalid Status: %s", s)
	}
}

func (status Status) IsUnstarted() bool {
	return status == StatusCreated || status == StatusConfigProposed
}

type GameType string

const (
	GameTypeStandard GameType = "Standard"
	GameTypeBlitz    GameType = "Blitz"
	GameTypeCustom   GameType = "Custom"
)

const StandardMoveDuration = 2 * 60
const StandardGameDuration = 30 * 60

func (gt *GameType) UnmarshalJSON(data []byte) error {
	var s string
	err := json.Unmarshal(data, &s)
	if err != nil {
		return err
	}
	switch GameType(s) {
	case GameTypeStandard, GameTypeBlitz, GameTypeCustom:
		*gt = GameType(s)
		return nil
	default:
		return fmt.Errorf("invalid Status: %s", s)
	}
}

type ConfigRoom struct {
	ID             GameID          `gorm:"primaryKey;autoIncrement;autoIncrementIncrement:1" json:"-"`
	Creator        MinimalUser     `gorm:"embedded;embeddedPrefix:creator_;not null" json:"creator"`
	CreatorElo     float64         `gorm:"not null" json:"creatorElo"`
	ChosenOpponent *MinimalUser    `gorm:"embedded;embeddedPrefix:chosen_opponent_" json:"chosenOpponent"`
	Status         Status          `gorm:"not null" json:"status"`
	FirstPlayer    FirstPlayer     `gorm:"not null" json:"firstPlayer"`
	GameType       GameType        `gorm:"not null" json:"gameType"`
	MoveDuration   uint32          `gorm:"not null" json:"moveDuration"`
	GameDuration   uint32          `gorm:"not null" json:"gameDuration"`
	RulesConfig    json.RawMessage `json:"rulesConfig"`
	GameName       string          `gorm:"not null" json:"gameName"`
}

type Candidate struct {
	ID     uint64      `gorm:"primaryKey;autoIncrement;type:bigserial" json:"-"`
	GameID GameID      `gorm:"index;not null;foreignKey:ConfigRoom" json:"-"`
	User   MinimalUser `gorm:"embedded;embeddedPrefix:user_;not null"`
	Elo    float64     `gorm:"not null" json:"elo"`
}
