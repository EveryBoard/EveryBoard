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

var AllStatus = []Status{StatusCreated, StatusConfigProposed, StatusStarted, StatusFinished}

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

type ConfigProposal struct {
	GameType     GameType        `json:"gameType"`
	MoveDuration uint32          `json:"moveDuration"`
	GameDuration uint32          `json:"gameDuration"`
	FirstPlayer  FirstPlayer     `json:"firstPlayer"`
	RulesConfig  json.RawMessage `json:"rulesConfig"`
}

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
	ID                GameID          `gorm:"primaryKey;autoIncrement;autoIncrementIncrement:1" json:"-"`
	Creator           MinimalUser     `gorm:"embedded;embeddedPrefix:creator_;not null" json:"creator"`
	CreatorElo        float64         `gorm:"not null" json:"creatorElo"`
	ChosenOpponent    *MinimalUser    `gorm:"embedded;embeddedPrefix:chosen_opponent_" json:"chosenOpponent"`
	ChosenOpponentElo *float64        `json:"chosenOpponentElo"`
	Status            Status          `gorm:"not null" json:"status"`
	FirstPlayer       FirstPlayer     `gorm:"not null" json:"firstPlayer"`
	GameType          GameType        `gorm:"not null" json:"gameType"`
	MoveDuration      uint32          `gorm:"not null" json:"moveDuration"`
	GameDuration      uint32          `gorm:"not null" json:"gameDuration"`
	RulesConfig       json.RawMessage `json:"rulesConfig"`
	GameName          string          `gorm:"not null" json:"gameName"`
}

// Needed for tests, but better placed here
var ConfigRoomRows = []string{
	"id",
	"creator_id", "creator_name", "creator_elo",
	"chosen_opponent_id", "chosen_opponent_name", "chosen_opponent_elo",
	"status", "first_player", "game_type", "move_duration", "game_duration",
	"rules_config", "game_name",
}

type Candidate struct {
	ID     uint64      `gorm:"primaryKey;autoIncrement;autoIncrementIncrement:1" json:"-"`
	GameID GameID      `gorm:"index;not null;foreignKey:ConfigRoom" json:"-"`
	User   MinimalUser `gorm:"embedded;embeddedPrefix:user_;not null"`
	Elo    float64     `gorm:"not null" json:"elo"`
}

var CandidateRows = []string{"id", "game_id", "user_id", "user_name", "elo"}
