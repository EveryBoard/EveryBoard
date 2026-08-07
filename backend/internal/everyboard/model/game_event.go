package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

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

type RequestPayload struct {
	RequestType Proposition `json:"requestType"`
}

type ReplyPayload struct {
	RequestType Proposition     `json:"requestType"`
	Accept      bool            `json:"accept"`
	Data        json.RawMessage `json:"data,omitempty"`
}

type Action string

const (
	ActionStartGame   Action = "StartGame"
	ActionEndGame     Action = "EndGame"
	ActionSync        Action = "Sync"
	ActionAddMoveTime Action = "AddMoveTime"
	ActionAddGameTime Action = "AddGameTime"
)

func (a *Action) UnmarshalJSON(data []byte) error {
	var s string
	err := json.Unmarshal(data, &s)
	if err != nil {
		return err
	}
	switch Action(s) {
	case ActionStartGame, ActionEndGame, ActionSync, ActionAddMoveTime, ActionAddGameTime:
		*a = Action(s)
		return nil
	default:
		return fmt.Errorf("invalid Action: %s", s)
	}
}

type ActionPayload struct {
	Action Action `json:"action"`
}

type AddTimeKind string

const (
	AddTimeMove AddTimeKind = "Move"
	AddTimeGame AddTimeKind = "Game"
)

func ActionAddTime(kind AddTimeKind) ActionPayload {
	if kind == AddTimeMove {
		return ActionPayload{Action: ActionAddMoveTime}
	} else {
		return ActionPayload{Action: ActionAddGameTime}
	}
}

type MovePayload struct {
	Move json.RawMessage `json:"move"`
}

type EventType string

const (
	EventTypeMove    EventType = "Move"
	EventTypeAction  EventType = "Action"
	EventTypeRequest EventType = "Request"
	EventTypeReply   EventType = "Reply"
)

type EventData interface {
	EventType() EventType
	AllowedInConfigRoomStatus(status Status) bool
}

type EventPayload struct {
	EventData
}

func (e EventPayload) Value() (driver.Value, error) {
	if e.EventData == nil {
		return nil, fmt.Errorf("nil event data")
	}
	// We need to flatten eventType into the same object as EventData.
	// Since EventData is an interface, we can't use embedding for flattening.
	// We use a map as a middle ground to achieve the flat structure.
	data, err := json.Marshal(e.EventData)
	if err != nil {
		return nil, err
	}
	var res map[string]any
	if err := json.Unmarshal(data, &res); err != nil {
		return nil, err
	}
	res["eventType"] = e.EventType()
	return json.Marshal(res)
}

func (e *EventPayload) Scan(value any) error {
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to unmarshal EventPayload: not []byte")
	}
	data, err := UnmarshalEventData(bytes)
	if err != nil {
		return err
	}
	e.EventData = data
	return nil
}

func (p RequestPayload) AllowedInConfigRoomStatus(status Status) bool {
	if p.RequestType == PropositionRematch {
		return status == StatusFinished
	}
	return status == StatusStarted
}

func (p ReplyPayload) AllowedInConfigRoomStatus(status Status) bool {
	if p.RequestType == PropositionRematch {
		return status == StatusFinished
	}
	return status == StatusStarted
}

func (ActionPayload) AllowedInConfigRoomStatus(status Status) bool {
	return status == StatusStarted
}

func (MovePayload) AllowedInConfigRoomStatus(status Status) bool {
	return status == StatusStarted
}

func (RequestPayload) EventType() EventType { return EventTypeRequest }
func (ReplyPayload) EventType() EventType   { return EventTypeReply }
func (ActionPayload) EventType() EventType  { return EventTypeAction }
func (MovePayload) EventType() EventType    { return EventTypeMove }

func WrapEventData(e EventData) EventPayload {
	return EventPayload{e}
}

var (
	EventDataSync      = WrapEventData(ActionPayload{Action: ActionSync})
	EventDataEndGame   = WrapEventData(ActionPayload{Action: ActionEndGame})
	EventDataStartGame = WrapEventData(ActionPayload{Action: ActionStartGame})
)

func EventDataRequest(proposition Proposition) EventPayload {
	return WrapEventData(RequestPayload{RequestType: proposition})
}

func EventDataReplyReject(proposition Proposition) EventPayload {
	return WrapEventData(ReplyPayload{
		RequestType: proposition,
		Accept:      false,
		Data:        nil,
	})
}

func EventDataReplyAccept(proposition Proposition, data json.RawMessage) EventPayload {
	return WrapEventData(ReplyPayload{
		RequestType: proposition,
		Accept:      true,
		Data:        data,
	})
}

func EventDataAddTime(kind AddTimeKind) EventPayload {
	return WrapEventData(ActionAddTime(kind))
}

func EventDataMove(move json.RawMessage) EventPayload {
	return WrapEventData(MovePayload{Move: move})
}

func UnmarshalEventData(data []byte) (EventData, error) {
	var helper struct {
		EventType EventType `json:"eventType"`
	}
	err := json.Unmarshal(data, &helper)
	if err != nil {
		return nil, err
	}

	var e EventData
	switch helper.EventType {
	case EventTypeRequest:
		var p RequestPayload
		if err := json.Unmarshal(data, &p); err != nil {
			return nil, err
		}
		e = p
	case EventTypeReply:
		var p ReplyPayload
		if err := json.Unmarshal(data, &p); err != nil {
			return nil, err
		}
		e = p
	case EventTypeAction:
		var p ActionPayload
		if err := json.Unmarshal(data, &p); err != nil {
			return nil, err
		}
		e = p
	case EventTypeMove:
		var p MovePayload
		if err := json.Unmarshal(data, &p); err != nil {
			return nil, err
		}
		e = p
	default:
		return nil, fmt.Errorf("unknown EventType: %s", helper.EventType)
	}

	return e, nil
}

type GameEvent struct {
	ID        uint64       `gorm:"primaryKey;autoIncrement;autoIncrementIncrement:1" json:"-"`
	GameID    GameID       `gorm:"index;not null;foreignKey:ConfigRoom" json:"-"`
	Timestamp int64        `gorm:"not null" json:"timestamp"`
	User      MinimalUser  `gorm:"not null;embedded;embeddedPrefix:user_" json:"user"`
	Data      EventPayload `gorm:"not null;type:json" json:"data"`
}

var GameEventRows = []string{"id", "game_id", "timestamp", "user_id", "user_name", "data"}

func (e GameEvent) MarshalJSON() ([]byte, error) {
	if e.Data.EventData == nil {
		return nil, fmt.Errorf("nil event data")
	}

	// Since EventData is an interface, embedding it in a struct does not flatten it
	// (it would be under an "EventData" key). To achieve the flat structure required
	// by the frontend, we marshal the payload and then merge in the common fields.
	data, err := json.Marshal(e.Data.EventData)
	if err != nil {
		return nil, err
	}

	var res map[string]any
	if err := json.Unmarshal(data, &res); err != nil {
		return nil, err
	}

	res["timestamp"] = e.Timestamp
	res["user"] = e.User
	res["eventType"] = e.Data.EventType()

	return json.Marshal(res)
}

func (e *GameEvent) UnmarshalJSON(data []byte) error {
	type helper struct {
		Timestamp int64       `json:"timestamp"`
		User      MinimalUser `json:"user"`
	}
	var h helper
	if err := json.Unmarshal(data, &h); err != nil {
		return err
	}

	eventData, err := UnmarshalEventData(data)
	if err != nil {
		return err
	}

	e.Timestamp = h.Timestamp
	e.User = h.User
	e.Data = WrapEventData(eventData)

	if p, ok := e.Data.EventData.(MovePayload); ok {
		if string(p.Move) == "" {
			return fmt.Errorf("missing move payload")
		}
	}
	return nil
}
