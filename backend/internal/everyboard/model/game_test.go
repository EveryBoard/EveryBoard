package model

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestResultIsDraw(t *testing.T) {
	expectDraw := func(result Result) {
		assert.True(t, result.IsDraw(), "should be a draw: %s", result)
	}
	expectNotDraw := func(result Result) {
		assert.False(t, result.IsDraw(), "should not be draw: %s", result)
	}

	expectNotDraw(ResultInProgress)
	expectNotDraw(ResultResignOfZero)
	expectNotDraw(ResultResignOfOne)
	expectNotDraw(ResultVictoryOfZero)
	expectNotDraw(ResultVictoryOfOne)
	expectNotDraw(ResultTimeoutOfZero)
	expectNotDraw(ResultTimeoutOfOne)

	expectDraw(ResultHardDraw)
	expectDraw(ResultAgreedDrawByZero)
	expectDraw(ResultAgreedDrawByOne)
}

func TestResultIsVictoryOfZero(t *testing.T) {
	expectVictoryOfZero := func(result Result) {
		assert.True(t, result.IsVictoryOfZero(), "should be a victory of zero: %s", result)
	}
	expectNotVictoryOfZero := func(result Result) {
		assert.False(t, result.IsVictoryOfZero(), "should not be a victory of zero: %s", result)
	}

	expectVictoryOfZero(ResultVictoryOfZero)
	expectVictoryOfZero(ResultResignOfOne)
	expectVictoryOfZero(ResultTimeoutOfOne)

	expectNotVictoryOfZero(ResultInProgress)
	expectNotVictoryOfZero(ResultResignOfZero)
	expectNotVictoryOfZero(ResultVictoryOfOne)
	expectNotVictoryOfZero(ResultTimeoutOfZero)
	expectNotVictoryOfZero(ResultHardDraw)
	expectNotVictoryOfZero(ResultAgreedDrawByZero)
	expectNotVictoryOfZero(ResultAgreedDrawByOne)
}

func TestResultIsVictoryOfOne(t *testing.T) {
	expectVictoryOfOne := func(result Result) {
		assert.True(t, result.IsVictoryOfOne(), "should be a victory of one: %s", result)
	}
	expectNotVictoryOfOne := func(result Result) {
		assert.False(t, result.IsVictoryOfOne(), "should not be a victory of one: %s", result)
	}

	expectVictoryOfOne(ResultVictoryOfOne)
	expectVictoryOfOne(ResultResignOfZero)
	expectVictoryOfOne(ResultTimeoutOfZero)

	expectNotVictoryOfOne(ResultInProgress)
	expectNotVictoryOfOne(ResultResignOfOne)
	expectNotVictoryOfOne(ResultVictoryOfZero)
	expectNotVictoryOfOne(ResultTimeoutOfOne)
	expectNotVictoryOfOne(ResultHardDraw)
	expectNotVictoryOfOne(ResultAgreedDrawByZero)
	expectNotVictoryOfOne(ResultAgreedDrawByOne)
}

func TestResultIsTimeout(t *testing.T) {
	expectTimeout := func(result Result) {
		assert.True(t, result.IsTimeout(), "should be a timeout: %s", result)
	}
	expectNotTimeout := func(result Result) {
		assert.False(t, result.IsTimeout(), "should not be a timeout: %s", result)
	}

	expectTimeout(ResultTimeoutOfZero)
	expectTimeout(ResultTimeoutOfOne)

	expectNotTimeout(ResultVictoryOfOne)
	expectNotTimeout(ResultResignOfZero)
	expectNotTimeout(ResultInProgress)
	expectNotTimeout(ResultResignOfOne)
	expectNotTimeout(ResultVictoryOfZero)
	expectNotTimeout(ResultHardDraw)
	expectNotTimeout(ResultAgreedDrawByZero)
	expectNotTimeout(ResultAgreedDrawByOne)
}

func TestMarshalResult(t *testing.T) {
	ExpectMarshallingToWorkBothWays(t, ResultInProgress, `"InProgress"`)
	ExpectMarshallingToWorkBothWays(t, ResultHardDraw, `"HardDraw"`)
	ExpectMarshallingToWorkBothWays(t, ResultResignOfZero, `"ResignOfZero"`)
	ExpectMarshallingToWorkBothWays(t, ResultResignOfOne, `"ResignOfOne"`)
	ExpectMarshallingToWorkBothWays(t, ResultVictoryOfZero, `"VictoryOfZero"`)
	ExpectMarshallingToWorkBothWays(t, ResultVictoryOfOne, `"VictoryOfOne"`)
	ExpectMarshallingToWorkBothWays(t, ResultTimeoutOfZero, `"TimeoutOfZero"`)
	ExpectMarshallingToWorkBothWays(t, ResultTimeoutOfOne, `"TimeoutOfOne"`)
	ExpectMarshallingToWorkBothWays(t, ResultAgreedDrawByZero, `"AgreedDrawByZero"`)
	ExpectMarshallingToWorkBothWays(t, ResultAgreedDrawByOne, `"AgreedDrawByOne"`)

	// It should also fail to unmarshal incorrect results
	var result Result
	ExpectUnmarshallingToFail(t, &result, `"bli"`)
	ExpectUnmarshallingToFail(t, &result, `42`)
}

func TestMarshalGame(t *testing.T) {
	original := Game{
		GameID:        0, // not part of the JSON
		GameName:      "Go",
		PlayerZero:    MinimalUser{ID: "zero", Name: "alice"},
		PlayerZeroElo: 42.0,
		PlayerOne:     MinimalUser{ID: "one", Name: "bob"},
		PlayerOneElo:  100.0,
		Result:        ResultInProgress,
		Beginning:     1000,
	}
	json := `{"gameName":"Go","playerZero":{"id":"zero","name":"alice"},"playerZeroElo":42,"playerOne":{"id":"one","name":"bob"},"playerOneElo":100,"result":"InProgress","beginning":1000}`
	ExpectMarshallingToWork(t, original, json)

	// It should not allow to unmarshal, even a valid game
	var result Game
	ExpectUnmarshallingToFail(t, &result, `{}`)
	ExpectUnmarshallingToFail(t, &result, json)
}
