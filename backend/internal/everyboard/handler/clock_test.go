package handler

import "testing"

func TestDefaultClockAndRandomFunctions(t *testing.T) {
	t.Run("Now", func(t *testing.T) {
		n := Now()
		if n <= 0 {
			t.Errorf("unexpected value from Now: %d", n)
		}
	})

	t.Run("NowFloat", func(t *testing.T) {
		nf := NowFloat()
		if nf <= 0 {
			t.Errorf("unexpected value from NowFloat: %f", nf)
		}
	})

	t.Run("RandBool", func(t *testing.T) {
		_ = RandBool()
	})
}
