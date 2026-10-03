package model

import (
	"testing"
)

func TestMarshalMinimalUser(t *testing.T) {
	original := MinimalUser{ID: "foo", Name: "bar"}
	json := `{"id":"foo","name":"bar"}`
	ExpectMarshallingToWork(t, original, json)
}

func TestMarshalMinimalBotUser(t *testing.T) {
	original := MinimalUser{ID: "bot", Name: "EveryBot", IsBot: true}
	json := `{"id":"bot","name":"EveryBot","isBot":true}`
	ExpectMarshallingToWork(t, original, json)
}

func TestMarshalCurrentGameWithoutOpponent(t *testing.T) {
	creator := MinimalUser{
		ID:   "foo",
		Name: "foo",
	}
	original := CurrentGame{
		// GameID is not part of the JSON
		GameID: 42,

		User:                  creator,
		Creator:               creator,
		CreatorBotIdentifier:  nil,
		GameName:              "Go",
		Opponent:              nil,
		OpponentBotIdentifier: nil,
		Role:                  UserRolePlayer,
	}
	json := `{"id":"JgaEB","gameName":"Go","creator":{"id":"foo","name":"foo"},"creatorBotIdentifier":null,"opponent":null,"opponentBotIdentifier":null,"role":"Player"}`
	ExpectMarshallingToWork(t, original, json)
}

func TestMarshalCurrentGameWithOpponent(t *testing.T) {
	creator := MinimalUser{
		ID:   "foo",
		Name: "foo",
	}
	opponent := MinimalUser{
		ID:   "bar",
		Name: "bar",
	}
	original := CurrentGame{
		// GameID is not part of the JSON
		GameID: 42,

		User:                  creator,
		Creator:               creator,
		CreatorBotIdentifier:  nil,
		Opponent:              &opponent,
		OpponentBotIdentifier: nil,
		GameName:              "Go",
		Role:                  UserRolePlayer,
	}
	json := `{"id":"JgaEB","gameName":"Go","creator":{"id":"foo","name":"foo"},"creatorBotIdentifier":null,"opponent":{"id":"bar","name":"bar"},"opponentBotIdentifier":null,"role":"Player"}`
	ExpectMarshallingToWork(t, original, json)
}

func TestMarshalCurrentGameWithBotIdentifiers(t *testing.T) {
	// Given a current game between two bots
	creator := MinimalUser{ID: "foo", Name: "foo", IsBot: true}
	opponent := MinimalUser{ID: "bar", Name: "bar", IsBot: true}
	original := CurrentGame{
		GameID:  42,
		User:    creator,
		Creator: creator,
		CreatorBotIdentifier: &BotIdentifier{
			DisplayName: "Creator bot",
		},
		Opponent: &opponent,
		OpponentBotIdentifier: &BotIdentifier{
			DisplayName: "Opponent bot",
		},
		GameName: "Go",
		Role:     UserRolePlayer,
	}

	// When marshaling the current game
	json := `{"id":"JgaEB","gameName":"Go","creator":{"id":"foo","name":"foo","isBot":true},"creatorBotIdentifier":{"displayName":"Creator bot","parameters":null},"opponent":{"id":"bar","name":"bar","isBot":true},"opponentBotIdentifier":{"displayName":"Opponent bot","parameters":null},"role":"Player"}`

	// Then both bot identifiers should be included
	ExpectMarshallingToWork(t, original, json)
}
