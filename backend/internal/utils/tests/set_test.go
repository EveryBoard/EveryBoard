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

func TestSetRemove(t *testing.T) {
	set := utils.NewSet[int]()
	set.Add(42)
	set.Remove(42)
	if set.Exists(42) {
		t.Errorf("element should have been removed")
	}
}

func TestSetClone(t *testing.T) {
	set := utils.NewSet[int]()
	set.Add(42)
	clone := set.Clone()
	if !clone.Exists(42) {
		t.Errorf("clone should have element")
	}
	clone.Remove(42)
	if set.Exists(42) && !clone.Exists(42) {
		// all good
	} else {
		t.Errorf("cloning failed")
	}
}
