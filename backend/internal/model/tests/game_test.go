package model

import (
	"encoding/json"
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

func TestMarshalResult(t *testing.T) {
	ExpectMarshallingToWork(t, model.ResultInProgress, `"InProgress"`)
	ExpectMarshallingToWork(t, model.ResultHardDraw, `"HardDraw"`)
	ExpectMarshallingToWork(t, model.ResultResignOfZero, `"ResignOfZero"`)
	ExpectMarshallingToWork(t, model.ResultResignOfOne, `"ResignOfOne"`)
	ExpectMarshallingToWork(t, model.ResultVictoryOfZero, `"VictoryOfZero"`)
	ExpectMarshallingToWork(t, model.ResultVictoryOfOne, `"VictoryOfOne"`)
	ExpectMarshallingToWork(t, model.ResultTimeoutOfZero, `"TimeoutOfZero"`)
	ExpectMarshallingToWork(t, model.ResultTimeoutOfOne, `"TimeoutOfOne"`)
	ExpectMarshallingToWork(t, model.ResultAgreedDrawByZero, `"AgreedDrawByZero"`)
	ExpectMarshallingToWork(t, model.ResultAgreedDrawByOne, `"AgreedDrawByOne"`)

	// It should also fail to unmarshal incorrect results
	var result model.Result
	err := json.Unmarshal([]byte(`"bli"`), &result)
	if err == nil {
		t.Errorf("succesfully unmarshaled while it should not!")
	}
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
}
