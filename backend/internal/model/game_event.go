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

type EventData struct {
	Type    EventType
	Payload interface{}
}

var (
	EventDataSync      = EventData{Type: EventTypeAction, Payload: ActionPayload{Action: ActionSync}}
	EventDataEndGame   = EventData{Type: EventTypeAction, Payload: ActionPayload{Action: ActionEndGame}}
	EventDataStartGame = EventData{Type: EventTypeAction, Payload: ActionPayload{Action: ActionStartGame}}
)

func EventDataRequest(proposition Proposition) EventData {
	return EventData{
		Type:    EventTypeRequest,
		Payload: RequestPayload{RequestType: proposition},
	}
}

func EventDataReplyReject(proposition Proposition) EventData {
	return EventData{
		Type: EventTypeReply,
		Payload: ReplyPayload{
			RequestType: proposition,
			Accept:      false,
			Data:        nil,
		},
	}
}

func EventDataReplyAccept(proposition Proposition, data json.RawMessage) EventData {
	return EventData{
		Type: EventTypeReply,
		Payload: ReplyPayload{
			RequestType: proposition,
			Accept:      true,
			Data:        data,
		},
	}
}

func EventDataAddTime(kind AddTimeKind) EventData {
	return EventData{
		Type:    EventTypeAction,
		Payload: ActionAddTime(kind),
	}
}

func EventDataMove(move json.RawMessage) EventData {
	return EventData{
		Type:    EventTypeMove,
		Payload: MovePayload{Move: move},
	}
}

func (e EventData) Value() (driver.Value, error) {
	return json.Marshal(e)
}

func (e *EventData) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to unmarshal EventData: not []byte")
	}
	return json.Unmarshal(bytes, e)
}

func (e EventData) MarshalJSON() ([]byte, error) {
	payloadBytes, err := json.Marshal(e.Payload)
	if err != nil {
		return nil, err
	}

	var payloadFields map[string]json.RawMessage
	err = json.Unmarshal(payloadBytes, &payloadFields)
	if err != nil {
		return nil, err
	}
	if payloadFields == nil {
		return nil, fmt.Errorf("empty payload")
	}

	payloadFields["eventType"], err = json.Marshal(string(e.Type))
	if err != nil {
		return nil, err
	}

	return json.Marshal(payloadFields)
}

func (e *EventData) UnmarshalJSON(data []byte) error {
	var raw map[string]json.RawMessage
	err := json.Unmarshal(data, &raw)
	if err != nil {
		return err
	}

	typeField, ok := raw["eventType"]
	if !ok {
		return fmt.Errorf("missing eventType field")
	}
	err = json.Unmarshal(typeField, &e.Type)
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
		var p RequestPayload
		if err := json.Unmarshal(payloadBytes, &p); err != nil {
			return err
		}
		e.Payload = p
	case EventTypeReply:
		var p ReplyPayload
		if err := json.Unmarshal(payloadBytes, &p); err != nil {
			return err
		}
		e.Payload = p
	case EventTypeAction:
		var p ActionPayload
		if err := json.Unmarshal(payloadBytes, &p); err != nil {
			return err
		}
		e.Payload = p
	case EventTypeMove:
		var p MovePayload
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
	ID        uint64      `gorm:"primaryKey;autoIncrement" json:"-"`
	GameID    GameID      `gorm:"index;not null;foreignKey:ConfigRoom" json:"-"`
	Timestamp int64       `gorm:"not null" json:"timestamp"`
	User      MinimalUser `gorm:"not null;embedded;embeddedPrefix:user_" json:"user"`
	Data      EventData   `gorm:"not null;serializer:json" json:"data"`
}

func (e GameEvent) MarshalJSON() ([]byte, error) {
	dataBytes, err := json.Marshal(e.Data)
	if err != nil {
		// TODO FOR REVIEW: this error should not be reachable. We can't define
		// an e.Data that cannot be converted to JSON. Similarly for other
		// errors in this function, and actually quite some more in the project.
		// But it is safer to propagate the errors instead of ignoring them or
		// making the server crash. How do we deal with coverage in this case?
		// For comparison, this would be like trying to cover every exception
		// that can be raised by any function in JavaScript. We don't do this in
		// the frontend because it is unfeasible (e.g., JSON.parse in JS can
		// throw, but we don't check at every place we call it if we cover the
		// exceptional case). But in Go, there is no notion of exceptions, all
		// errors are explicit. I would be for aiming for a high coverage, but
		// not 100%. One trick could be to explicitly annotate such cases with
		// e.g., a comment stating "uncoverable" (and maybe a rationale as to
		// why it is not coverable), and having a script that checks that
		// besides such lines, we have 100% coverage.
		return nil, err
	}

	var dataFields map[string]json.RawMessage
	err = json.Unmarshal(dataBytes, &dataFields)
	if err != nil {
		return nil, err
	}

	dataFields["time"], err = json.Marshal(e.Timestamp)
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
	err := json.Unmarshal(data, &raw)
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

	err = json.Unmarshal(timeField, &e.Timestamp)
	if err != nil {
		return err
	}

	err = json.Unmarshal(userField, &e.User)
	if err != nil {
		return err
	}

	rawBytes, err := json.Marshal(raw)
	if err != nil {
		return err
	}

	err = json.Unmarshal(rawBytes, &e.Data)
	if err != nil {
		return err
	}

	return nil
}
