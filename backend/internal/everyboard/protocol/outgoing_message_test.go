package protocol

import (
	"encoding/json"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/stretchr/testify/require"
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
		GameName:      "Go",
		PlayerZero:    minimalUser,
		PlayerZeroElo: 42.0,
		PlayerOne:     model.MinimalUser{ID: "bar", Name: "bar"},
		PlayerOneElo:  100.0,
		Result:        model.ResultInProgress,
		Beginning:     42,
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
		`{"gameId":"JgaEB","configRoom":{"creator":{"id":"foo","name":"foo"},"creatorElo":0,"creatorBotIdentifier":null,"chosenOpponent":null,"chosenOpponentElo":null,"chosenOpponentBotIdentifier":null,"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1200,"rulesConfig":null,"gameName":"Go"}}`, "ConfigRoomUpdate")

	configRoom.CreatorBotIdentifier = &model.BotIdentifier{
		DisplayName: "Perfect P4",
		Parameters:  json.RawMessage(`{"version":1}`),
	}
	ExpectMarshallingToWorkAndTagToBe(t,
		ConfigRoomUpdateMessage{
			GameID:     42,
			ConfigRoom: configRoom,
		},
		`{"gameId":"JgaEB","configRoom":{"creator":{"id":"foo","name":"foo"},"creatorElo":0,"creatorBotIdentifier":{"displayName":"Perfect P4","parameters":{"version":1}},"chosenOpponent":null,"chosenOpponentElo":null,"chosenOpponentBotIdentifier":null,"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1200,"rulesConfig":null,"gameName":"Go"}}`, "ConfigRoomUpdate")

	chosenOpponent := model.MinimalUser{ID: "bar", Name: "bar", IsBot: true}
	chosenOpponentElo := 42.0
	configRoom.ChosenOpponent = &chosenOpponent
	configRoom.ChosenOpponentElo = &chosenOpponentElo
	configRoom.ChosenOpponentBotIdentifier = &model.BotIdentifier{
		DisplayName: "Opponent bot",
		Parameters:  json.RawMessage(`{"version":2}`),
	}
	ExpectMarshallingToWorkAndTagToBe(t,
		ConfigRoomUpdateMessage{
			GameID:     42,
			ConfigRoom: configRoom,
		},
		`{"gameId":"JgaEB","configRoom":{"creator":{"id":"foo","name":"foo"},"creatorElo":0,"creatorBotIdentifier":{"displayName":"Perfect P4","parameters":{"version":1}},"chosenOpponent":{"id":"bar","name":"bar","isBot":true},"chosenOpponentElo":42,"chosenOpponentBotIdentifier":{"displayName":"Opponent bot","parameters":{"version":2}},"status":"Created","firstPlayer":"Random","gameType":"Standard","moveDuration":120,"gameDuration":1200,"rulesConfig":null,"gameName":"Go"}}`, "ConfigRoomUpdate")

	ExpectMarshallingToWorkAndTagToBe(t,
		ConfigRoomDeletedMessage{
			GameID: 42,
		},
		`{"gameId":"JgaEB"}`, "ConfigRoomDeleted")

	ExpectMarshallingToWorkAndTagToBe(t,
		CandidateJoinedMessage{
			Candidate: minimalUser,
			Elo:       42.0,
		},
		`{"candidate":{"id":"foo","name":"foo"},"elo":42,"botIdentifier":null}`, "CandidateJoined")

	ExpectMarshallingToWorkAndTagToBe(t,
		CandidateJoinedMessage{
			Candidate: minimalUser,
			Elo:       42.0,
			BotIdentifier: &model.BotIdentifier{
				DisplayName: "Perfect P4",
				Parameters:  json.RawMessage(`{"version":1}`),
			},
		},
		`{"candidate":{"id":"foo","name":"foo"},"elo":42,"botIdentifier":{"displayName":"Perfect P4","parameters":{"version":1}}}`, "CandidateJoined")

	ExpectMarshallingToWorkAndTagToBe(t,
		CandidateLeftMessage{
			Candidate: minimalUser,
		},
		`{"candidate":{"id":"foo","name":"foo"}}`, "CandidateLeft")

	ExpectMarshallingToWorkAndTagToBe(t,
		GameUpdateMessage{
			Game: game,
		},
		`{"game":{"gameName":"Go","playerZero":{"id":"foo","name":"foo"},"playerZeroElo":42,"playerZeroBotIdentifier":null,"playerOne":{"id":"bar","name":"bar"},"playerOneElo":100,"playerOneBotIdentifier":null,"result":"InProgress","beginning":42}}`, "GameUpdate")

	game.PlayerZeroBotIdentifier = &model.BotIdentifier{
		DisplayName: "Player zero bot",
		Parameters:  json.RawMessage(`{"version":1}`),
	}
	game.PlayerOneBotIdentifier = &model.BotIdentifier{
		DisplayName: "Player one bot",
		Parameters:  json.RawMessage(`{"version":2}`),
	}
	ExpectMarshallingToWorkAndTagToBe(t,
		GameUpdateMessage{
			Game: game,
		},
		`{"game":{"gameName":"Go","playerZero":{"id":"foo","name":"foo"},"playerZeroElo":42,"playerZeroBotIdentifier":{"displayName":"Player zero bot","parameters":{"version":1}},"playerOne":{"id":"bar","name":"bar"},"playerOneElo":100,"playerOneBotIdentifier":{"displayName":"Player one bot","parameters":{"version":2}},"result":"InProgress","beginning":42}}`, "GameUpdate")

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
