package model

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

func ExpectMarshallingToWorkAndTagToBe(t *testing.T, original model.OutgoingMessage, expectedJSON string, expectedTag string) {
	ExpectMarshallingToWork(t, original, expectedJSON)
	if expectedTag != original.Tag() {
		t.Fatalf("invalid tag: expected %s, got %s", expectedTag, original.Tag())
	}
}

func TestMarshalOutgoingMessages(t *testing.T) {
	minimalUser := model.MinimalUser{ID: "foo", Name: "foo"}
	message := model.Message{
		Sender:    minimalUser,
		Timestamp: 42,
		Content:   "hello",
	}
	configRoom := model.ConfigRoom{
		Creator:      minimalUser,
		CreatorElo:   0.0,
		Status:       model.StatusCreated,
		FirstPlayer:  model.FirstPlayerRandom,
		GameType:     model.GameTypeStandard,
		MoveDuration: 120,
		GameDuration: 1200,
		GameName:     "Go",
	}
	game := model.Game{
		GameName:   "Go",
		PlayerZero: minimalUser,
		PlayerOne:  model.MinimalUser{ID: "bar", Name: "bar"},
		Result:     model.ResultInProgress,
		Beginning:  42,
	}
	gameEvent := model.GameEvent{
		Timestamp: 42,
		User:      minimalUser,
		Data:      model.EventDataRequest(model.PropositionDraw),
	}

	ExpectMarshallingToWorkAndTagToBe(t,
		model.ErrorMessage{Reason: "error"},
		`{"reason":"error"}`, "Error")

	ExpectMarshallingToWorkAndTagToBe(t,
		model.ChatMessage{Message: message},
		`{"message":{"sender":{"id":"foo","name":"foo"},"timestamp":42,"content":"hello"}}`, "ChatMessage")

	ExpectMarshallingToWorkAndTagToBe(t,
		model.GameCreatedMessage{GameID: 42},
		`{"gameId":"JgaEB"}`, "GameCreated")

	ExpectMarshallingToWorkAndTagToBe(t,
		model.ConfigRoomUpdateMessage{
			GameID:     42,
			ConfigRoom: configRoom,
		},
		`{"gameId":"JgaEB","configRoom":{"creator":{"id":"foo","name":"foo"},"creatorElo":0,"chosenOpponent":null,"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1200,"rulesConfig":null,"gameName":"Go"}}`, "ConfigRoomUpdate")

	ExpectMarshallingToWorkAndTagToBe(t,
		model.ConfigRoomDeletedMessage{
			GameID: 42,
		},
		`{"gameId":"JgaEB"}`, "ConfigRoomDeleted")

	ExpectMarshallingToWorkAndTagToBe(t,
		model.CandidateJoinedMessage{
			Candidate: minimalUser,
		},
		`{"candidate":{"id":"foo","name":"foo"}}`, "CandidateJoined")

	ExpectMarshallingToWorkAndTagToBe(t,
		model.CandidateLeftMessage{
			Candidate: minimalUser,
		},
		`{"candidate":{"id":"foo","name":"foo"}}`, "CandidateLeft")

	ExpectMarshallingToWorkAndTagToBe(t,
		model.GameUpdateMessage{
			Game: game,
		},
		`{"game":{"gameName":"Go","playerZero":{"id":"foo","name":"foo"},"playerOne":{"id":"bar","name":"bar"},"result":"InProgress","beginning":42}}`, "GameUpdate")

	ExpectMarshallingToWorkAndTagToBe(t,
		model.GameEventMessage{
			Event:      gameEvent,
			ServerTime: 42.0,
		},
		`{"event":{"eventType":"Request","requestType":"Draw","timestamp":42,"user":{"id":"foo","name":"foo"}},"serverTime":42}`, "GameEvent")

	ExpectMarshallingToWorkAndTagToBe(t,
		model.CurrentGameUpdateMessage{
			CurrentGame: nil,
		},
		`{"currentGame":null}`, "CurrentGameUpdate")

}
