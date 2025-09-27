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
	creator := model.MinimalUser{
		ID: "foo",
		Name: "foo",
	}
	original := model.CurrentGame{
		// GameID is not part of the JSON
		GameID: 42,

		User: creator,
		Creator: creator,
		GameName: "Go",
		Opponent: nil,
		Role: model.UserRolePlayer,
	}
	json := `{"id":"JgaEB","gameName":"Go","creator":{"id":"foo","name":"foo"},"opponent":null,"role":"Player"}`
	ExpectMarshallingToWork(t, original, json)
}

func TestMarshalCurrentGameWithOpponent(t *testing.T) {
	creator := model.MinimalUser{
		ID: "foo",
		Name: "foo",
	}
	opponent := model.MinimalUser{
		ID: "bar",
		Name: "bar",
	}
	original := model.CurrentGame{
		// GameID is not part of the JSON
		GameID: 42,

		User: creator,
		Creator: creator,
		Opponent: &opponent,
		GameName: "Go",
		Role: model.UserRolePlayer,
	}
	json := `{"id":"JgaEB","gameName":"Go","creator":{"id":"foo","name":"foo"},"opponent":{"id":"bar","name":"bar"},"role":"Player"}`
	ExpectMarshallingToWork(t, original, json)
}
