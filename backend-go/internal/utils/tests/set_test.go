package internal

import (
	"testing"

	utils "github.com/EveryBoard/EveryBoard/internal/utils"
)

func TestSetAddThenExists(t *testing.T) {
	// Given an empty set
	set := utils.NewSet[int]()
	// When adding an element to the set
	set.Add(42)
	// Then the element should be in the set
	if !set.Exists(42) {
		t.Errorf("element should be in the set")
	}
	// But another element should not be in the set
	if set.Exists(37) {
		t.Errorf("element should not be in the set")
	}
}
