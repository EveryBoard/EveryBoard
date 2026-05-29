package model

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestIsUnstarted(t *testing.T) {
	assert.True(t, StatusCreated.IsUnstarted(), "StatusCreated should be unstarted")
	assert.True(t, StatusConfigProposed.IsUnstarted(), "StatusConfigProposed should be unstarted")
	assert.False(t, StatusStarted.IsUnstarted(), "StatusStarted should be started")
	assert.False(t, StatusFinished.IsUnstarted(), "StatusFinished should be started")
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
