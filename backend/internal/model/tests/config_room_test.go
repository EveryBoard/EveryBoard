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
