package model

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

func TestIsUnstarted(t *testing.T) {
	if !model.StatusCreated.IsUnstarted() {
		t.Errorf("StatusCreated should be unstarted")
	}
	if !model.StatusConfigProposed.IsUnstarted() {
		t.Errorf("StatusConfigProposed should be unstarted")
	}
	if model.StatusStarted.IsUnstarted() {
		t.Errorf("StatusStarted should be started")
	}
	if model.StatusFinished.IsUnstarted() {
		t.Errorf("StatusFinished should be started")
	}
}

func TestMarshalFirstPlayer(t *testing.T) {
	ExpectMarshallingToWorkBothWays(t, model.FirstPlayerRandom, `"Random"`)
	ExpectMarshallingToWorkBothWays(t, model.FirstPlayerChosenOpponent, `"ChosenOpponent"`)
	ExpectMarshallingToWorkBothWays(t, model.FirstPlayerCreator, `"Creator"`)

	// It should also fail to unmarshal incorrect results
	var result model.FirstPlayer
	ExpectMarshallingToFail(t, &result, `"bli"`)
	ExpectMarshallingToFail(t, &result, `42`)
}

func TestMarshalStatus(t *testing.T) {
	ExpectMarshallingToWorkBothWays(t, model.StatusCreated, `"Created"`)
	ExpectMarshallingToWorkBothWays(t, model.StatusConfigProposed, `"ConfigProposed"`)
	ExpectMarshallingToWorkBothWays(t, model.StatusStarted, `"Started"`)
	ExpectMarshallingToWorkBothWays(t, model.StatusFinished, `"Finished"`)

	// It should also fail to unmarshal incorrect results
	var result model.Status
	ExpectMarshallingToFail(t, &result, `"bli"`)
	ExpectMarshallingToFail(t, &result, `42`)
}

func TestMarshalGameType(t *testing.T) {
	ExpectMarshallingToWorkBothWays(t, model.GameTypeStandard, `"Standard"`)
	ExpectMarshallingToWorkBothWays(t, model.GameTypeBlitz, `"Blitz"`)
	ExpectMarshallingToWorkBothWays(t, model.GameTypeCustom, `"Custom"`)

	// It should also fail to unmarshal incorrect results
	var result model.GameType
	ExpectMarshallingToFail(t, &result, `"bli"`)
	ExpectMarshallingToFail(t, &result, `42`)
}
