package model

import (
	"testing"
)

func TestIsUnstarted(t *testing.T) {
	if !StatusCreated.IsUnstarted() {
		t.Errorf("StatusCreated should be unstarted")
	}
	if !StatusConfigProposed.IsUnstarted() {
		t.Errorf("StatusConfigProposed should be unstarted")
	}
	if StatusStarted.IsUnstarted() {
		t.Errorf("StatusStarted should be started")
	}
	if StatusFinished.IsUnstarted() {
		t.Errorf("StatusFinished should be started")
	}
}

func TestMarshalFirstPlayer(t *testing.T) {
	ExpectMarshallingToWorkBothWays(t, FirstPlayerRandom, `"Random"`)
	ExpectMarshallingToWorkBothWays(t, FirstPlayerChosenOpponent, `"ChosenOpponent"`)
	ExpectMarshallingToWorkBothWays(t, FirstPlayerCreator, `"Creator"`)

	// It should also fail to unmarshal incorrect results
	var result FirstPlayer
	ExpectUnmarshallingToFail(t, &result, `"bli"`)
	ExpectUnmarshallingToFail(t, &result, `42`)
}

func TestMarshalStatus(t *testing.T) {
	ExpectMarshallingToWorkBothWays(t, StatusCreated, `"Created"`)
	ExpectMarshallingToWorkBothWays(t, StatusConfigProposed, `"ConfigProposed"`)
	ExpectMarshallingToWorkBothWays(t, StatusStarted, `"Started"`)
	ExpectMarshallingToWorkBothWays(t, StatusFinished, `"Finished"`)

	// It should also fail to unmarshal incorrect results
	var result Status
	ExpectUnmarshallingToFail(t, &result, `"bli"`)
	ExpectUnmarshallingToFail(t, &result, `42`)
}

func TestMarshalGameType(t *testing.T) {
	ExpectMarshallingToWorkBothWays(t, GameTypeStandard, `"Standard"`)
	ExpectMarshallingToWorkBothWays(t, GameTypeBlitz, `"Blitz"`)
	ExpectMarshallingToWorkBothWays(t, GameTypeCustom, `"Custom"`)

	// It should also fail to unmarshal incorrect results
	var result GameType
	ExpectUnmarshallingToFail(t, &result, `"bli"`)
	ExpectUnmarshallingToFail(t, &result, `42`)
}
