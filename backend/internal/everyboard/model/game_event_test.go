package model

import (
	"encoding/json"
	"testing"
)

func MakeGameEvent(data EventPayload) GameEvent {
	minimalUser := MinimalUser{ID: "foo", Name: "foo"}
	return GameEvent{
		Timestamp: 42,
		User:      minimalUser,
		Data:      data,
	}
}

func TestMarshalAndUnmarshalGameEvents(t *testing.T) {
	move := MakeGameEvent(EventDataMove(json.RawMessage(`42`)))
	ExpectMarshallingToWorkBothWays(t, move, `{"eventType":"Move","move":42,"timestamp":42,"user":{"id":"foo","name":"foo"}}`)

	addMoveTime := MakeGameEvent(EventDataAddTime(AddTimeMove))
	ExpectMarshallingToWorkBothWays(t, addMoveTime, `{"action":"AddMoveTime","eventType":"Action","timestamp":42,"user":{"id":"foo","name":"foo"}}`)

	addGameTime := MakeGameEvent(EventDataAddTime(AddTimeGame))
	ExpectMarshallingToWorkBothWays(t, addGameTime, `{"action":"AddGameTime","eventType":"Action","timestamp":42,"user":{"id":"foo","name":"foo"}}`)

	sync := MakeGameEvent(EventDataSync)
	ExpectMarshallingToWorkBothWays(t, sync, `{"action":"Sync","eventType":"Action","timestamp":42,"user":{"id":"foo","name":"foo"}}`)

	start := MakeGameEvent(EventDataStartGame)
	ExpectMarshallingToWorkBothWays(t, start, `{"action":"StartGame","eventType":"Action","timestamp":42,"user":{"id":"foo","name":"foo"}}`)

	end := MakeGameEvent(EventDataEndGame)
	ExpectMarshallingToWorkBothWays(t, end, `{"action":"EndGame","eventType":"Action","timestamp":42,"user":{"id":"foo","name":"foo"}}`)

	takeBackRequest := MakeGameEvent(EventDataRequest(PropositionTakeBack))
	ExpectMarshallingToWorkBothWays(t, takeBackRequest, `{"eventType":"Request","requestType":"TakeBack","timestamp":42,"user":{"id":"foo","name":"foo"}}`)

	drawRequest := MakeGameEvent(EventDataRequest(PropositionDraw))
	ExpectMarshallingToWorkBothWays(t, drawRequest, `{"eventType":"Request","requestType":"Draw","timestamp":42,"user":{"id":"foo","name":"foo"}}`)

	rematchRequest := MakeGameEvent(EventDataRequest(PropositionRematch))
	ExpectMarshallingToWorkBothWays(t, rematchRequest, `{"eventType":"Request","requestType":"Rematch","timestamp":42,"user":{"id":"foo","name":"foo"}}`)

	replyAccept := MakeGameEvent(EventDataReplyAccept(PropositionTakeBack, json.RawMessage(`null`)))
	ExpectMarshallingToWorkBothWays(t, replyAccept, `{"accept":true,"data":null,"eventType":"Reply","requestType":"TakeBack","timestamp":42,"user":{"id":"foo","name":"foo"}}`)

	replyReject := MakeGameEvent(EventDataReplyReject(PropositionTakeBack))
	ExpectMarshallingToWorkBothWays(t, replyReject, `{"accept":false,"eventType":"Reply","requestType":"TakeBack","timestamp":42,"user":{"id":"foo","name":"foo"}}`)
}

func TestUnmarshalInvalidGameEventFails(t *testing.T) {
	// Invalid because JSON is not a dictionary
	ExpectUnmarshallingToFail(t, &GameEvent{}, `42`)
	// Invalid because of missing fields
	ExpectUnmarshallingToFail(t, &GameEvent{}, `{}`)
	ExpectUnmarshallingToFail(t, &GameEvent{}, `{"timestamp": 42}`)
	// Invalid because of invalid time
	ExpectUnmarshallingToFail(t, &GameEvent{}, `{"eventType":"Request","requestType":42,"timestamp":"fourtytwo","user":{"id":"foo","name":"foo"}}`)
	// Invalid because of invalid user
	ExpectUnmarshallingToFail(t, &GameEvent{}, `{"eventType":"Request","requestType":42,"timestamp":42,"user":"lol"}`)
	// Invalid because of invalid proposition
	ExpectUnmarshallingToFail(t, &GameEvent{}, `{"eventType":"Request","requestType":"TakeBick","timestamp":42,"user":{"id":"foo","name":"foo"}}`)
	ExpectUnmarshallingToFail(t, &GameEvent{}, `{"eventType":"Request","requestType":42,"timestamp":42,"user":{"id":"foo","name":"foo"}}`)
	// Invalid because of invalid reply
	ExpectUnmarshallingToFail(t, &GameEvent{}, `{"accept":42,"eventType":"Reply","requestType":"TakeBack","timestamp":42,"user":{"id":"foo","name":"foo"}}`)
	// Invalid because of invalid action
	ExpectUnmarshallingToFail(t, &GameEvent{}, `{"action":42,"eventType":"Action","timestamp":42,"user":{"id":"foo","name":"foo"}}`)
	ExpectUnmarshallingToFail(t, &GameEvent{}, `{"action":"Lol","eventType":"Action","timestamp":42,"user":{"id":"foo","name":"foo"}}`)
	// Invalid because of invalid event data
	ExpectUnmarshallingToFail(t, &GameEvent{}, `{"eventType":"Lql","requestType":42,"timestamp":42,"user":{"id":"foo","name":"foo"}}`)
	ExpectUnmarshallingToFail(t, &GameEvent{}, `{"eventType":42,"requestType":42,"timestamp":42,"user":{"id":"foo","name":"foo"}}`)
	ExpectUnmarshallingToFail(t, &GameEvent{}, `{"requestType":42,"timestamp":42,"user":{"id":"foo","name":"foo"}}`)
	// Invalid because of invalid move
	ExpectUnmarshallingToFail(t, &GameEvent{}, `{"eventType":"Move","timestamp":42,"user":{"id":"foo","name":"foo"}}`)
}

func TestMarshalInvalidGameEventFails(t *testing.T) {
	// Invalid because empty payload
	ExpectMarshallingToFail(t, MakeGameEvent(WrapEventData(nil)))
}

func TestEventInGameOrNot(t *testing.T) {
	expectToBeAllowedOnlyIn := func(eventData EventPayload, allowedStatus Status) {
		for _, status := range AllStatus {
			if status == allowedStatus {
				if !eventData.AllowedInConfigRoomStatus(status) {
					t.Fatalf("event is not allowed in status %v but should be: %v", status, eventData)
				}
			} else {
				if eventData.AllowedInConfigRoomStatus(status) {
					t.Fatalf("event is allowed in status %v but should not be: %v", status, eventData)
				}
			}
		}
	}
	expectToBeAllowedOnlyIn(EventDataMove(json.RawMessage(`{"x": 42}`)), StatusStarted)
	expectToBeAllowedOnlyIn(EventDataAddTime(AddTimeGame), StatusStarted)
	expectToBeAllowedOnlyIn(EventDataAddTime(AddTimeMove), StatusStarted)
	expectToBeAllowedOnlyIn(EventDataStartGame, StatusStarted)
	expectToBeAllowedOnlyIn(EventDataEndGame, StatusStarted)
	expectToBeAllowedOnlyIn(EventDataRequest(PropositionTakeBack), StatusStarted)
	expectToBeAllowedOnlyIn(EventDataRequest(PropositionDraw), StatusStarted)
	expectToBeAllowedOnlyIn(EventDataRequest(PropositionRematch), StatusFinished)
	expectToBeAllowedOnlyIn(EventDataReplyAccept(PropositionTakeBack, nil), StatusStarted)
	expectToBeAllowedOnlyIn(EventDataReplyAccept(PropositionDraw, nil), StatusStarted)
	expectToBeAllowedOnlyIn(EventDataReplyAccept(PropositionRematch, nil), StatusFinished)
	expectToBeAllowedOnlyIn(EventDataReplyReject(PropositionTakeBack), StatusStarted)
	expectToBeAllowedOnlyIn(EventDataReplyReject(PropositionDraw), StatusStarted)
	expectToBeAllowedOnlyIn(EventDataReplyReject(PropositionRematch), StatusFinished)
}
