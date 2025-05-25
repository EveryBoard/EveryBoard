package model

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

func TestMarshalMinimalUser(t *testing.T) {
	original := model.MinimalUser{ID: "foo", Name: "bar"}
	json := `{"id":"foo","name":"bar"}`
	ExpectMarshallingToWork(t, original, json)
}

func TestMarshalCurrentGameWithoutOpponent(t *testing.T) {
	original := model.CurrentGame{
		// UserID and GameID are not part of the JSON
		UserID: "",
		GameID: 42,

		GameName: "Go",
		Opponent: nil,
		Role: model.UserRolePlayer,
	}
	json := `{"id":"JgaEB","gameName":"Go","opponent":null,"role":"Player"}`
	ExpectMarshallingToWork(t, original, json)
}

func TestMarshalCurrentGameWithOpponent(t *testing.T) {
	original := model.CurrentGame{
		// UserID and GameID are not part of the JSON
		UserID: "",
		GameID: 42,

		GameName: "Go",
		Opponent: &model.MinimalUser{ID: "foo", Name: "bar"},
		Role: model.UserRolePlayer,
	}
	json := `{"id":"JgaEB","gameName":"Go","opponent":{"id":"foo","name":"bar"},"role":"Player"}`
	ExpectMarshallingToWork(t, original, json)
}
