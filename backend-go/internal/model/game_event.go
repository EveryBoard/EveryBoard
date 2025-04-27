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

type Request struct {
	RequestType Proposition `json:"requestType"`
}

type Reply struct {
	RequestType Proposition     `json:"requestType"`
	Accept      bool            `json:"accept"`
	Data        json.RawMessage `json:"data,omitempty"`
}

type Action struct {
	Action string `json:"action"`
}

var (
	ActionStartGame Action = Action{Action: "StartGame"}
	ActionEndGame   Action = Action{Action: "EndGame"}
	ActionSync      Action = Action{Action: "Sync"}
)

type AddTimeKind string

const (
	AddTimeTurn = "Turn"
	AddTimeGage = "Global" // TODO: rename from global to game everywhere
)

func ActionAddTime(kind AddTimeKind) Action {
	if kind == AddTimeTurn {
		return Action{Action: "AddTurnTime"}
	} else {
		return Action{Action: "AddGlobalTime"} // TODO: AddGameTime
	}
}

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
	EventDataSync    = EventData{Type: EventTypeAction, Payload: ActionSync}
	EventDataEndGame = EventData{Type: EventTypeAction, Payload: ActionEndGame}
)

func EventDataRequest(proposition Proposition) EventData {
	return EventData{
		Type:    EventTypeRequest,
		Payload: Request{RequestType: proposition},
	}
}

func EventDataReplyReject(proposition Proposition) EventData {
	return EventData{
		Type: EventTypeReply,
		Payload: Reply{
			RequestType: proposition,
			Accept:      false,
			Data:        nil,
		},
	}
}

func EventDataReplyAccept(proposition Proposition, data json.RawMessage) EventData {
	return EventData{
		Type: EventTypeReply,
		Payload: Reply{
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
		Payload: Move{ Move: move },
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
		payloadFields = make(map[string]json.RawMessage)
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
	Data   EventData   `gorm:"not null;serializer:json" json:"data"`
}

func (e GameEvent) MarshalJSON() ([]byte, error) {
	dataBytes, err := json.Marshal(e.Data)
	if err != nil {
		return nil, err
	}

	var dataFields map[string]json.RawMessage
	err = json.Unmarshal(dataBytes, &dataFields)
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
