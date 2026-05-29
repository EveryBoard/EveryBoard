package rating

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestNewEloValue(t *testing.T) {
	tests := []struct {
		oldElo     float64
		difference float64
		expected   float64
	}{
		{1500.0, 32.0, 1532.0},
		{100.0, -10.0, 100.0},
		{105.0, -10.0, 100.0},
	}

	for _, tt := range tests {
		got := newEloValue(tt.oldElo, tt.difference)
		assert.Equal(t, tt.expected, got, "newEloValue(%f, %f)", tt.oldElo, tt.difference)
	}
}

func TestWinWeight(t *testing.T) {
	assert.Equal(t, 1.0, w(Victory), "unexpected victory weight")
	assert.Equal(t, 0.5, w(Draw), "unexpected draw weight")
	assert.Equal(t, 0.0, w(Loss), "unexpected loss weight")
}

func TestWinProbability(t *testing.T) {
	p := winProbability(1000, 1000)
	assert.Equal(t, 0.5, p, "unexpected win probability")
}
