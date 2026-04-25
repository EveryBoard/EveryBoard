package model

import (
	"encoding/json"
	"fmt"
)

type Result string

const (
	ResultInProgress       Result = "InProgress"
	ResultHardDraw         Result = "HardDraw"
	ResultResignOfZero     Result = "ResignOfZero"
	ResultResignOfOne      Result = "ResignOfOne"
	ResultVictoryOfZero    Result = "VictoryOfZero"
	ResultVictoryOfOne     Result = "VictoryOfOne"
	ResultTimeoutOfZero    Result = "TimeoutOfZero"
	ResultTimeoutOfOne     Result = "TimeoutOfOne"
	ResultAgreedDrawByZero Result = "AgreedDrawByZero"
	ResultAgreedDrawByOne  Result = "AgreedDrawByOne"
)

func (r Result) IsDraw() bool {
	return r == ResultHardDraw || r == ResultAgreedDrawByZero || r == ResultAgreedDrawByOne
}

func (r Result) IsVictoryOfZero() bool {
	return r == ResultResignOfOne || r == ResultTimeoutOfOne || r == ResultVictoryOfZero
}

func (r Result) IsVictoryOfOne() bool {
	return r == ResultResignOfZero || r == ResultTimeoutOfZero || r == ResultVictoryOfOne
}

func (r Result) IsTimeout() bool {
	return r == ResultTimeoutOfZero || r == ResultTimeoutOfOne
}

func (r *Result) UnmarshalJSON(data []byte) error {
	var s string
	err := json.Unmarshal(data, &s)
	if err != nil {
		return err
	}
	switch Result(s) {
	case ResultInProgress, ResultHardDraw,
		ResultResignOfZero, ResultResignOfOne, ResultVictoryOfZero, ResultVictoryOfOne,
		ResultTimeoutOfZero, ResultTimeoutOfOne, ResultAgreedDrawByZero, ResultAgreedDrawByOne:
		*r = Result(s)
		return nil
	default:
		return fmt.Errorf("invalid Result: %s", s)
	}
}

type Game struct {
	GameID        GameID      `gorm:"index;not null;foreignKey:ConfigRoom;primaryKey;autoIncrement:false" json:"-"`
	GameName      string      `gorm:"not null" json:"gameName"`
	PlayerZero    MinimalUser `gorm:"embedded;embeddedPrefix:player_zero_;not null" json:"playerZero"`
	PlayerZeroElo float64     `gorm:"not null" json:"playerZeroElo"`
	PlayerOne     MinimalUser `gorm:"embedded;embeddedPrefix:player_one_;not null" json:"playerOne"`
	PlayerOneElo  float64     `gorm:"not null" json:"playerOneElo"`
	Result        Result      `gorm:"not null" json:"result"`
	Beginning     int64       `gorm:"not null" json:"beginning"`
}

var GameRows = []string{
	"game_id", "game_name",
	"player_zero_id", "player_zero_name", "player_zero_elo",
	"player_one_id", "player_one_name", "player_one_elo",
	"result", "beginning",
}

func (g *Game) UnmarshalJSON(data []byte) error {
	return fmt.Errorf("not allowed to unmarshall game")
}
