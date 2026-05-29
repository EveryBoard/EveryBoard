package rating

import "testing"

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
		if got != tt.expected {
			t.Errorf("newEloValue(%f, %f) = %f; want %f", tt.oldElo, tt.difference, got, tt.expected)
		}
	}
}

func TestWinWeight(t *testing.T) {
	if w(Victory) != 1.0 {
		t.Errorf("expected 1.0, got %f", w(Victory))
	}
	if w(Draw) != 0.5 {
		t.Errorf("expected 0.5, got %f", w(Draw))
	}
	if w(Loss) != 0.0 {
		t.Errorf("expected 0.0, got %f", w(Loss))
	}
}

func TestWinProbability(t *testing.T) {
	p := winProbability(1000, 1000)
	if p != 0.5 {
		t.Errorf("expected 0.5, got %f", p)
	}
}
