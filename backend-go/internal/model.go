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
	err := json.Unmarshal(data, &s)
	if err != nil {
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
	GameTypeStandard GameType = "STANDARD"
	GameTypeBlitz    GameType = "BLITZ"
	GameTypeCustom   GameType = "CUSTOM"
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

type Elo struct {
	ID          uint64      `gorm:"primaryKey;autoincrement" json:"-"`
	User        MinimalUser `gorm:"embedded;embeddedPrefix:user_;not null" json:"-"`
	GameName    string      `gorm:"not null" json:"-"`
	CurrentElo  float64     `gorm:"not null" json:"currentElo"`
	GamesPlayed uint        `goorm:"not null" json:"gamesPlayed"`
}

type ConfigRoom struct {
	ID             GameID       `gorm:"primaryKey;autoIncrement" json:"-"`
	Creator        MinimalUser  `gorm:"embedded;embeddedPrefix:creator_;not null" json:"creator"`
	CreatorElo     float64      `gorm:"not null" json:"creatorElo"`
	ChosenOpponent *MinimalUser `gorm:"embedded;embeddedPrefix:chosen_opponent_" json:"chosenOpponent"`
	Status         Status       `gorm:"not null" json:"partStatus"`
	FirstPlayer    FirstPlayer  `gorm:"not null" json:"firstPlayer"`
	GameType       GameType     `gorm:"not null" json:"partType"`
	MoveDuration   uint32       `gorm:"not null" json:"maximalMoveDuration"`
	// TODO: rename json to gameDuration/moveDuration (why "part" + why "maximal" vs. "total")
	GameDuration uint32          `gorm:"not null" json:"totalPartDuration"`
	RulesConfig  json.RawMessage `json:"rulesConfig"`
	GameName     string          `gorm:"not null" json:"gameName"`
}

type Candidate struct {
	ID     uint64      `gorm:"primaryKey;autoincrement" json:"-"`
	GameID GameID      `gorm:"index;not null;foreignKey:ConfigRoom" json:"-"`
	User   MinimalUser `gorm:"embedded;embeddedPrefix:user_;not null"`
}

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
	GameID     GameID      `gorm:"index;not null;foreignKey:ConfigRoom" json:"-"`
	GameName   string      `gorm:"not null" json:"gameName"`
	PlayerZero MinimalUser `gorm:"embedded;embeddedPrefix:player_zero_;not null" json:"playerZero"`
	PlayerOne  MinimalUser `gorm:"embedded;embeddedPrefix;player_one_;not null" json:"playerOne"`
	Result     Result      `gorm:"not null" json:"result"`
	Beginning  int64       `gorm:"not null" json:"beginning"`
}

type Proposition string

const (
	PropositionTakeBack Proposition = "TakeBack"
	PropositionDraw     Proposition = "Draw"
	PropositionRematch  Proposition = "Rematch"
)

func (p *Proposition) UnmarshalJSON(data []byte) error {
	var s string
	err := json.Unmarshal(data, &s)
	if err != nil {
		return err
	}
	switch Proposition(s) {
	case PropositionTakeBack, PropositionDraw, PropositionRematch:
		*p = Proposition(s)
		return nil
	default:
		return fmt.Errorf("invalid Proposition: %s", s)
	}
}

type Request struct {
	RequestType Proposition `json:"requestType"`
}

type Reply struct {
	RequestType Proposition `json:"requestType"`
	Accept      bool        `json:"accept"`
	Data        *string     `json:"data,omitempty"`
}

func ReplyAccept(p Proposition, data *string) Reply {
	return Reply{RequestType: p, Accept: true, Data: data}
}

func ReplyRefuse(p Proposition) Reply {
	return Reply{RequestType: p, Accept: false}
}

type Action struct {
	Action string `json:"action"`
}

var (
	ActionStartGame     Action = Action{Action: "StartGame"}
	ActionEndGame       Action = Action{Action: "EndGame"}
	ActionSync          Action = Action{Action: "Sync"}
	ActionAddTurnTime   Action = Action{Action: "AddTurnTime"}
	ActionAddGlobalTime Action = Action{Action: "AddGlobalTime"}
)

type Move struct {
	Move json.RawMessage `json:"move"`
}

type EventType string

const (
	EventTypeMove    EventType = "Move"
	EventTypeAction  EventType = "Action"
	EventTypeRequest EventType = "Request"
	EventTypeReply   EventType = "Reply"
)

type EventData struct {
	Type    EventType
	Payload interface{}
}

var (
	EventDataSync = EventData{Type: EventTypeAction, Payload: ActionSync}
)

func (e EventData) MarshalJSON() ([]byte, error) {
	payloadBytes, err := json.Marshal(e.Payload)
	if err != nil {
		return nil, err
	}

	var payloadFields map[string]json.RawMessage
	err = json.Unmarshal(payloadBytes, &payloadFields);
	if err != nil {
		return nil, err
	}


	payloadFields["eventType"], err = json.Marshal(string(e.Type))
	if err != nil {
		return nil, err
	}

	return json.Marshal(payloadFields)
}

func (e *EventData) UnmarshalJSON(data []byte) error {
	var raw map[string]json.RawMessage
	err := json.Unmarshal(data, &raw);
	if err != nil {
		return err
	}

	typeField, ok := raw["eventType"]
	if !ok {
		return fmt.Errorf("missing eventType field")
	}
	err = json.Unmarshal(typeField, &e.Type);
	if err != nil {
		return err
	}
	delete(raw, "eventType")

	payloadBytes, err := json.Marshal(raw)
	if err != nil {
		return err
	}

	switch e.Type {
	case EventTypeRequest:
		var p Request
		if err := json.Unmarshal(payloadBytes, &p); err != nil {
			return err
		}
		e.Payload = p
	case EventTypeReply:
		var p Reply
		if err := json.Unmarshal(payloadBytes, &p); err != nil {
			return err
		}
		e.Payload = p
	case EventTypeAction:
		var p Action
		if err := json.Unmarshal(payloadBytes, &p); err != nil {
			return err
		}
		e.Payload = p
	case EventTypeMove:
		var p Move
		if err := json.Unmarshal(payloadBytes, &p); err != nil {
			return err
		}
		e.Payload = p
	default:
		return fmt.Errorf("unknown EventType: %s", e.Type)
	}

	return nil
}

type GameEvent struct {
	ID     uint64      `gorm:"primaryKey;autoIncrement" json:"-"`
	GameID GameID      `gorm:"index;not null;foreignKey:ConfigRoom" json:"-"`
	Time   int64       `gorm:"not null" json:"time"`
	User   MinimalUser `gorm:"not null;embedded;embeddedPrefix:user_" json:"user"`
	Data   EventData   `gorm:"not null;type:json" json:"data"`
}

func (e GameEvent) MarshalJSON() ([]byte, error) {
	dataBytes, err := json.Marshal(e.Data)
	if err != nil {
		return nil, err
	}

	var dataFields map[string]json.RawMessage
	err = json.Unmarshal(dataBytes, &dataFields);
	if err != nil {
		return nil, err
	}

	dataFields["time"], err = json.Marshal(e.Time)
	if err != nil {
		return nil, err
	}

	dataFields["user"], err = json.Marshal(e.User)
	if err != nil {
		return nil, err
	}

	return json.Marshal(dataFields)
}

func (e *GameEvent) UnmarshalJSON(data []byte) error {
	var raw map[string]json.RawMessage
	err := json.Unmarshal(data, &raw);
	if err != nil {
		return err
	}

	timeField, ok := raw["time"]
	if !ok {
		return fmt.Errorf("missing time field")
	}
	delete(raw, "time")

	userField, ok := raw["user"]
	if !ok {
		return fmt.Errorf("missing user field")
	}
	delete(raw, "user")

	err = json.Unmarshal(timeField, e.Time)
	if err != nil {
		return err
	}

	err = json.Unmarshal(userField, e.User)
	if err != nil {
		return err
	}

	rawBytes, err := json.Marshal(raw)
	if err != nil {
		return err
	}

	err = json.Unmarshal(rawBytes, e.Data)
	if err != nil {
		return err
	}

	return nil
}
