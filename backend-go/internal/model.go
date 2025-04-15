package internal

import (
	"encoding/json"
	"fmt"
)

type MinimalUser struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

type Message struct {
	Sender    MinimalUser `json:"sender"`
	Timestamp int64       `json:"timestamp"`
	Content   string      `json:"content"`
}

type FirstPlayer string

const (
	Random       FirstPlayer = "RANDOM"
	ChosenPlayer FirstPlayer = "CHOSEN_PLAYER"
	Creator      FirstPlayer = "CREATOR"
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
	Created        Status = "Created"
	ConfigProposed Status = "ConfigProposed"
	Started        Status = "Started"
	Finished       Status = "Finished"
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
	Standard GameType = "STANDARD"
	Blitz    GameType = "BLITZ"
	Custom   GameType = "CUSTOM"
)

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

type ConfigRoom struct {
	Creator             MinimalUser     `json:"creator"`
	CreatorElo          float64         `json:"creatorElo"` // TODO: get rid of this here
	ChosenOpponent      *MinimalUser    `json:"chosenOpponent,omitempty"`
	Status              Status          `json:"partStatus"`
	FirstPlayer         FirstPlayer     `json:"firstPlayer"`
	GameType            GameType        `json:"partType"`
	MaximalMoveDuration int             `json:"maximalMoveDuration"`
	TotalPartDuration   int             `json:"totalPartDuration"`
	RulesConfig         json.RawMessage `json:"rulesConfig"`
	GameName            string          `json:"gameName"`
}
