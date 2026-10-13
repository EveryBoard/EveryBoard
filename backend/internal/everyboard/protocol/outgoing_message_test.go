package protocol

import (
	"github.com/stretchr/testify/require"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
)

func ExpectMarshallingToWorkAndTagToBe(t *testing.T, original OutgoingMessage, expectedJSON string, expectedTag string) {
	ExpectMarshallingToWork(t, original, expectedJSON)
	require.Equal(t, expectedTag, original.Tag(), "invalid tag")
}

func TestMarshalOutgoingMessages(t *testing.T) {
	minimalUser := model.MinimalUser{ID: "foo", Name: "foo"}
	message := model.Message{
		Sender:    minimalUser,
		Timestamp: 42,
		Content:   "hello",
	}
	configRoom := model.ConfigRoom{
		Creator:      model.PlayerInfo{User: minimalUser, Elo: 0.0},
		Status:       model.StatusCreated,
		FirstPlayer:  model.FirstPlayerRandom,
		GameType:     model.GameTypeStandard,
		MoveDuration: 120,
		GameDuration: 1200,
		GameName:     "Go",
	}
	game := model.Game{
		GameName:   "Go",
		PlayerZero: model.PlayerInfo{User: minimalUser, Elo: 42.0},
		PlayerOne:  model.PlayerInfo{User: model.MinimalUser{ID: "bar", Name: "bar"}, Elo: 100.0},
		Result:     model.ResultInProgress,
		Beginning:  42,
	}
	gameEvent := model.GameEvent{
		Timestamp: 42,
		User:      minimalUser,
		Data:      model.EventDataRequest(model.PropositionDraw),
	}

	ExpectMarshallingToWorkAndTagToBe(t,
		ErrorMessage{Reason: "error"},
		`{"reason":"error"}`, "Error")

	ExpectMarshallingToWorkAndTagToBe(t,
		ChatMessage{Message: message},
		`{"message":{"sender":{"id":"foo","name":"foo"},"timestamp":42,"content":"hello"}}`, "ChatMessage")

	ExpectMarshallingToWorkAndTagToBe(t,
		GameCreatedMessage{GameID: 42},
		`{"gameId":"JgaEB"}`, "GameCreated")

	ExpectMarshallingToWorkAndTagToBe(t,
		ConfigRoomUpdateMessage{
			GameID:     42,
			ConfigRoom: configRoom,
		},
		`{"gameId":"JgaEB","configRoom":{"creator":{"user":{"id":"foo","name":"foo"},"elo":0},"chosenOpponent":null,"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1200,"rulesConfig":null,"gameName":"Go"}}`, "ConfigRoomUpdate")

	ExpectMarshallingToWorkAndTagToBe(t,
		ConfigRoomDeletedMessage{
			GameID: 42,
		},
		`{"gameId":"JgaEB"}`, "ConfigRoomDeleted")

	ExpectMarshallingToWorkAndTagToBe(t,
		CandidateJoinedMessage{
			Candidate: model.PlayerInfo{User: minimalUser, Elo: 42.0},
		},
		`{"candidate":{"user":{"id":"foo","name":"foo"},"elo":42}}`, "CandidateJoined")

	ExpectMarshallingToWorkAndTagToBe(t,
		CandidateLeftMessage{
			Candidate: minimalUser,
		},
		`{"candidate":{"id":"foo","name":"foo"}}`, "CandidateLeft")

	ExpectMarshallingToWorkAndTagToBe(t,
		GameUpdateMessage{
			Game: game,
		},
		`{"game":{"gameName":"Go","playerZero":{"user":{"id":"foo","name":"foo"},"elo":42},"playerOne":{"user":{"id":"bar","name":"bar"},"elo":100},"result":"InProgress","beginning":42}}`, "GameUpdate")

	ExpectMarshallingToWorkAndTagToBe(t,
		GameEventMessage{
			Event:      gameEvent,
			ServerTime: 42.0,
		},
		`{"event":{"eventType":"Request","requestType":"Draw","timestamp":42,"user":{"id":"foo","name":"foo"}},"serverTime":42}`, "GameEvent")

	ExpectMarshallingToWorkAndTagToBe(t,
		CurrentGameUpdateMessage{
			CurrentGame: nil,
		},
		`{"currentGame":null}`, "CurrentGameUpdate")

}
