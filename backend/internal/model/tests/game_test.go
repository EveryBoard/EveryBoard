package model

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

func TestResultIsDraw(t *testing.T) {
	expectDraw := func(result model.Result) {
		if !result.IsDraw() {
			t.Errorf("should be a draw: %s", result)
		}
	}
	expectNotDraw := func(result model.Result) {
		if result.IsDraw() {
			t.Errorf("should not be draw: %s", result)
		}
	}

	expectNotDraw(model.ResultInProgress)
	expectNotDraw(model.ResultResignOfZero)
	expectNotDraw(model.ResultResignOfOne)
	expectNotDraw(model.ResultVictoryOfZero)
	expectNotDraw(model.ResultVictoryOfOne)
	expectNotDraw(model.ResultTimeoutOfZero)
	expectNotDraw(model.ResultTimeoutOfOne)

	expectDraw(model.ResultHardDraw)
	expectDraw(model.ResultAgreedDrawByZero)
	expectDraw(model.ResultAgreedDrawByOne)
}

func TestResultIsVictoryOfZero(t *testing.T) {
	expectVictoryOfZero := func(result model.Result) {
		if !result.IsVictoryOfZero() {
			t.Errorf("should be a victory of zero: %s", result)
		}
	}
	expectNotVictoryOfZero := func(result model.Result) {
		if result.IsVictoryOfZero() {
			t.Errorf("should not be a victory of zero: %s", result)
		}
	}

	expectVictoryOfZero(model.ResultVictoryOfZero)
	expectVictoryOfZero(model.ResultResignOfOne)
	expectVictoryOfZero(model.ResultTimeoutOfOne)

	expectNotVictoryOfZero(model.ResultInProgress)
	expectNotVictoryOfZero(model.ResultResignOfZero)
	expectNotVictoryOfZero(model.ResultVictoryOfOne)
	expectNotVictoryOfZero(model.ResultTimeoutOfZero)
	expectNotVictoryOfZero(model.ResultHardDraw)
	expectNotVictoryOfZero(model.ResultAgreedDrawByZero)
	expectNotVictoryOfZero(model.ResultAgreedDrawByOne)
}

func TestResultIsVictoryOfOne(t *testing.T) {
	expectVictoryOfOne := func(result model.Result) {
		if !result.IsVictoryOfOne() {
			t.Errorf("should be a victory of one: %s", result)
		}
	}
	expectNotVictoryOfOne := func(result model.Result) {
		if result.IsVictoryOfOne() {
			t.Errorf("should not be a victory of one: %s", result)
		}
	}

	expectVictoryOfOne(model.ResultVictoryOfOne)
	expectVictoryOfOne(model.ResultResignOfZero)
	expectVictoryOfOne(model.ResultTimeoutOfZero)

	expectNotVictoryOfOne(model.ResultInProgress)
	expectNotVictoryOfOne(model.ResultResignOfOne)
	expectNotVictoryOfOne(model.ResultVictoryOfZero)
	expectNotVictoryOfOne(model.ResultTimeoutOfOne)
	expectNotVictoryOfOne(model.ResultHardDraw)
	expectNotVictoryOfOne(model.ResultAgreedDrawByZero)
	expectNotVictoryOfOne(model.ResultAgreedDrawByOne)
}

func TestResultIsTimeout(t *testing.T) {
	expectTimeout := func(result model.Result) {
		if !result.IsTimeout() {
			t.Errorf("should be a timeout: %s", result)
		}
	}
	expectNotTimeout := func(result model.Result) {
		if !result.IsTimeout() {
			t.Errorf("should not be a timeout: %s", result)
		}
	}

	expectTimeout(model.ResultTimeoutOfZero)
	expectTimeout(model.ResultTimeoutOfOne)

	expectNotTimeout(model.ResultVictoryOfOne)
	expectNotTimeout(model.ResultResignOfZero)
	expectNotTimeout(model.ResultInProgress)
	expectNotTimeout(model.ResultResignOfOne)
	expectNotTimeout(model.ResultVictoryOfZero)
	expectNotTimeout(model.ResultHardDraw)
	expectNotTimeout(model.ResultAgreedDrawByZero)
	expectNotTimeout(model.ResultAgreedDrawByOne)
}

func TestMarshalResult(t *testing.T) {
	ExpectMarshallingToWorkBothWays(t, model.ResultInProgress, `"InProgress"`)
	ExpectMarshallingToWorkBothWays(t, model.ResultHardDraw, `"HardDraw"`)
	ExpectMarshallingToWorkBothWays(t, model.ResultResignOfZero, `"ResignOfZero"`)
	ExpectMarshallingToWorkBothWays(t, model.ResultResignOfOne, `"ResignOfOne"`)
	ExpectMarshallingToWorkBothWays(t, model.ResultVictoryOfZero, `"VictoryOfZero"`)
	ExpectMarshallingToWorkBothWays(t, model.ResultVictoryOfOne, `"VictoryOfOne"`)
	ExpectMarshallingToWorkBothWays(t, model.ResultTimeoutOfZero, `"TimeoutOfZero"`)
	ExpectMarshallingToWorkBothWays(t, model.ResultTimeoutOfOne, `"TimeoutOfOne"`)
	ExpectMarshallingToWorkBothWays(t, model.ResultAgreedDrawByZero, `"AgreedDrawByZero"`)
	ExpectMarshallingToWorkBothWays(t, model.ResultAgreedDrawByOne, `"AgreedDrawByOne"`)

	// It should also fail to unmarshal incorrect results
	var result model.Result
	ExpectUnmarshallingToFail(t, &result, `"bli"`)
	ExpectUnmarshallingToFail(t, &result, `42`)
}

func TestMarshalGame(t *testing.T) {
	original := model.Game{
		GameID:     0, // not part of the JSON
		GameName:   "Go",
		PlayerZero: model.MinimalUser{ID: "zero", Name: "alice"},
		PlayerOne:  model.MinimalUser{ID: "one", Name: "bob"},
		Result:     model.ResultInProgress,
		Beginning:  1000,
	}
	json := `{"gameName":"Go","playerZero":{"id":"zero","name":"alice"},"playerOne":{"id":"one","name":"bob"},"result":"InProgress","beginning":1000}`
	ExpectMarshallingToWork(t, original, json)

	// It should not allow to unmarshal, even a valid game
	var result model.Game
	ExpectUnmarshallingToFail(t, &result, `{}`)
	ExpectUnmarshallingToFail(t, &result, json)
}
