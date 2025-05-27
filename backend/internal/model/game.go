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
	GameID     GameID      `gorm:"index;not null;foreignKey:ConfigRoom;primaryKey;autoIncrement:false" json:"-"`
	GameName   string      `gorm:"not null" json:"gameName"`
	PlayerZero MinimalUser `gorm:"embedded;embeddedPrefix:player_zero_;not null" json:"playerZero"`
	PlayerOne  MinimalUser `gorm:"embedded;embeddedPrefix:player_one_;not null" json:"playerOne"`
	Result     Result      `gorm:"not null" json:"result"`
	Beginning  int64       `gorm:"not null" json:"beginning"`
}
