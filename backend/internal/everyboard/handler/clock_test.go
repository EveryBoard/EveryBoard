package handler

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDefaultClockAndRandomFunctions(t *testing.T) {
	t.Run("Now", func(t *testing.T) {
		n := Now()
		assert.Positive(t, n)
	})

	t.Run("NowFloat", func(t *testing.T) {
		nf := NowFloat()
		assert.Positive(t, nf)
	})

	t.Run("RandBool", func(t *testing.T) {
		_ = RandBool()
	})
}
