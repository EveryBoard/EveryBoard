package utils

import (
	"testing"
)

func TestSetAddThenExists(t *testing.T) {
	// Given an empty set
	set := NewSet[int]()
	// When adding an element to the set
	set.Add(42)
	// Then the element should be in the set
	if !set.Has(42) {
		t.Errorf("element should be in the set")
	}
	// But another element should not be in the set
	if set.Has(37) {
		t.Errorf("element should not be in the set")
	}
}

func TestSetRemove(t *testing.T) {
	// Given a set containing one element
	set := NewSet[int]()
	set.Add(42)
	// When removing that element
	set.Remove(42)
	// Then the element should not exist
	if set.Has(42) {
		t.Errorf("element should have been removed")
	}
}

func TestSetClone(t *testing.T) {
	// Given a set
	set := NewSet[int]()
	set.Add(42)
	// When cloning it
	clone := set.Clone()
	// Then it should have the same elements
	if !clone.Has(42) {
		t.Errorf("clone should have element")
	}
	// When changing the clone
	clone.Remove(42)
	// Then the original set should not be modified
	if !set.Has(42) {
		t.Errorf("original set should still contain the element")
	}
	if clone.Has(42) {
		t.Errorf("clone should not have the element after removing it")
	}
}
