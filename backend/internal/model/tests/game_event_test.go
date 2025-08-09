package model

import (
	"testing"
	"encoding/json"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

func MakeGameEvent(data model.EventData) model.GameEvent {
	minimalUser := model.MinimalUser{ID: "foo", Name: "foo"}
	return model.GameEvent{
		Timestamp: 42,
		User: minimalUser,
		Data: data,
	}
}

func TestMarshalAndUnmarshalGameEvents(t *testing.T) {
	move := MakeGameEvent(model.EventDataMove(json.RawMessage(`42`)))
	ExpectMarshallingToWorkBothWays(t, move, `{"eventType":"Move","move":42,"time":42,"user":{"id":"foo","name":"foo"}}`)

	addMoveTime := MakeGameEvent(model.EventDataAddTime(model.AddTimeMove))
	ExpectMarshallingToWorkBothWays(t, addMoveTime, `{"action":"AddMoveTime","eventType":"Action","time":42,"user":{"id":"foo","name":"foo"}}`)

	addGameTime := MakeGameEvent(model.EventDataAddTime(model.AddTimeGame))
	ExpectMarshallingToWorkBothWays(t, addGameTime, `{"action":"AddGameTime","eventType":"Action","time":42,"user":{"id":"foo","name":"foo"}}`)

	sync := MakeGameEvent(model.EventDataSync)
	ExpectMarshallingToWorkBothWays(t, sync, `{"action":"Sync","eventType":"Action","time":42,"user":{"id":"foo","name":"foo"}}`)

	start := MakeGameEvent(model.EventDataStartGame)
	ExpectMarshallingToWorkBothWays(t, start, `{"action":"StartGame","eventType":"Action","time":42,"user":{"id":"foo","name":"foo"}}`)

	end := MakeGameEvent(model.EventDataEndGame)
	ExpectMarshallingToWorkBothWays(t, end, `{"action":"EndGame","eventType":"Action","time":42,"user":{"id":"foo","name":"foo"}}`)

	takeBackRequest := MakeGameEvent(model.EventDataRequest(model.PropositionTakeBack))
	ExpectMarshallingToWorkBothWays(t, takeBackRequest, `{"eventType":"Request","requestType":"TakeBack","time":42,"user":{"id":"foo","name":"foo"}}`)

	drawRequest := MakeGameEvent(model.EventDataRequest(model.PropositionDraw))
	ExpectMarshallingToWorkBothWays(t, drawRequest, `{"eventType":"Request","requestType":"Draw","time":42,"user":{"id":"foo","name":"foo"}}`)

	rematchRequest := MakeGameEvent(model.EventDataRequest(model.PropositionRematch))
	ExpectMarshallingToWorkBothWays(t, rematchRequest, `{"eventType":"Request","requestType":"Rematch","time":42,"user":{"id":"foo","name":"foo"}}`)

	replyAccept := MakeGameEvent(model.EventDataReplyAccept(model.PropositionTakeBack, json.RawMessage(`null`)))
	ExpectMarshallingToWorkBothWays(t, replyAccept, `{"accept":true,"data":null,"eventType":"Reply","requestType":"TakeBack","time":42,"user":{"id":"foo","name":"foo"}}`)

	replyReject := MakeGameEvent(model.EventDataReplyReject(model.PropositionTakeBack))
	ExpectMarshallingToWorkBothWays(t, replyReject, `{"accept":false,"eventType":"Reply","requestType":"TakeBack","time":42,"user":{"id":"foo","name":"foo"}}`)
}

func TestUnmarshalInvalidGameEventFails(t *testing.T) {
	// Invalid because JSON is not a dictionary
	ExpectUnmarshallingToFail(t, &model.GameEvent{}, `42`)
	// Invalid because of missing fields
	ExpectUnmarshallingToFail(t, &model.GameEvent{}, `{}`)
	ExpectUnmarshallingToFail(t, &model.GameEvent{}, `{"time": 42}`)
	// Invalid because of invalid time
	ExpectUnmarshallingToFail(t, &model.GameEvent{}, `{"eventType":"Request","requestType":42,"time":"fourtytwo","user":{"id":"foo","name":"foo"}}`)
	// Invalid because of invalid user
	ExpectUnmarshallingToFail(t, &model.GameEvent{}, `{"eventType":"Request","requestType":42,"time":42,"user":"lol"}`)
	// Invalid because of invalid proposition
	ExpectUnmarshallingToFail(t, &model.GameEvent{}, `{"eventType":"Request","requestType":"TakeBick","time":42,"user":{"id":"foo","name":"foo"}}`)
	ExpectUnmarshallingToFail(t, &model.GameEvent{}, `{"eventType":"Request","requestType":42,"time":42,"user":{"id":"foo","name":"foo"}}`)
	// Invalid because of invalid reply
	ExpectUnmarshallingToFail(t, &model.GameEvent{}, `{"accept":42,"eventType":"Reply","requestType":"TakeBack","time":42,"user":{"id":"foo","name":"foo"}}`)
	// Invalid because of invalid action
	ExpectUnmarshallingToFail(t, &model.GameEvent{}, `{"action":42,"eventType":"Action","time":42,"user":{"id":"foo","name":"foo"}}`)
	ExpectUnmarshallingToFail(t, &model.GameEvent{}, `{"action":"Lol","eventType":"Action","time":42,"user":{"id":"foo","name":"foo"}}`)
	// Invalid because of invalid event data
	ExpectUnmarshallingToFail(t, &model.GameEvent{}, `{"eventType":"Lql","requestType":42,"time":42,"user":{"id":"foo","name":"foo"}}`)
	ExpectUnmarshallingToFail(t, &model.GameEvent{}, `{"eventType":42,"requestType":42,"time":42,"user":{"id":"foo","name":"foo"}}`)
	ExpectUnmarshallingToFail(t, &model.GameEvent{}, `{"requestType":42,"time":42,"user":{"id":"foo","name":"foo"}}`)
	// Invalid because of invalid move
	// TODO: ExpectUnmarshallingToFail(t, &model.GameEvent{}, `{"eventType":"Move","time":42,"user":{"id":"foo","name":"foo"}}`)
}

func TestMarshalInvalidGameEventFails(t *testing.T) {
	// Invalid because empty payload
	ExpectMarshallingToFail(t, MakeGameEvent(model.EventData{Type: model.EventTypeMove, Payload: nil}))
}
