package model

import (
	"testing"
)

func TestMarshalElo(t *testing.T) {
	original := Elo{
		// ID, UserID, UserName, and GameName are used in the DB but not in the JSON marshalling, hence we leave them empty
		ID:       0,
		UserID:   "",
		UserName: "",
		GameName: "",

		CurrentElo:  1.0,
		GamesPlayed: 1,
	}
	json := `{"currentElo":1,"gamesPlayed":1}`
	ExpectMarshallingToWork(t, original, json)
}
