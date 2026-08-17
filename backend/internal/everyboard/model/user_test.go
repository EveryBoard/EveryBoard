package model

import (
	"testing"
)

func TestMarshalMinimalUser(t *testing.T) {
	original := MinimalUser{ID: "foo", Name: "bar"}
	json := `{"id":"foo","name":"bar"}`
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

		User:     creator,
		Creator:  creator,
		GameName: "Go",
		Opponent: nil,
		Role:     UserRolePlayer,
	}
	json := `{"id":"JgaEB","gameName":"Go","creator":{"id":"foo","name":"foo"},"opponent":null,"role":"Player"}`
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

		User:     creator,
		Creator:  creator,
		Opponent: &opponent,
		GameName: "Go",
		Role:     UserRolePlayer,
	}
	json := `{"id":"JgaEB","gameName":"Go","creator":{"id":"foo","name":"foo"},"opponent":{"id":"bar","name":"bar"},"role":"Player"}`
	ExpectMarshallingToWork(t, original, json)
}
