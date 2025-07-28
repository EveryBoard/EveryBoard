package internal

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/model"
	everyboard "github.com/EveryBoard/EveryBoard/internal"
)

func TestEloComputationFirstGame(t *testing.T) {
	// Given two first-playing users at their first game
	emptyElo := model.Elo{
		CurrentElo: 0.0,
		GamesPlayed: 0,
	}

	// When computing the elo of the winner and loser after the game
    winnerElo, loserElo := everyboard.ComputeNewElos(emptyElo, emptyElo, false)

	// Then it should give 1 symbolic point to the loser for their first game and 30 to the winner
	expectedWinnerElo := model.Elo{
		CurrentElo: 30.0,
		GamesPlayed: 1,
	}
	expectedLoserElo := model.Elo{
		CurrentElo: 1.0,
		GamesPlayed: 1,
	}
	if winnerElo != expectedWinnerElo {
		t.Fatalf("unexpected winner elo: expected %v, got %v", expectedWinnerElo, winnerElo)
	}
	if loserElo != expectedLoserElo {
		t.Fatalf("unexpected loser elo: expected %v, got %v", expectedLoserElo, loserElo)
	}
}

func TestEloComputationSecondGame(t *testing.T) {
	// Given two second-game players that just fought each other with a win from zero
	oldWinnerElo := model.Elo{
		CurrentElo: 30.0,
		GamesPlayed: 1,
	}
	oldLoserElo := model.Elo{
		CurrentElo: 1.0,
		GamesPlayed: 1,
	}

	// When computing the elo after the game
    winnerElo, loserElo := everyboard.ComputeNewElos(oldWinnerElo, oldLoserElo, false)

	// Then it should give no point to the loser and a bit less than 30 points to the winner
	expectedWinnerElo := model.Elo{
		CurrentElo: 57.50173783711419,
		GamesPlayed: 2,
	}
	expectedLoserElo := model.Elo{
		CurrentElo: 1.0,
		GamesPlayed: 2,
	}
	if winnerElo != expectedWinnerElo {
		t.Fatalf("unexpected winner elo: expected %v, got %v", expectedWinnerElo, winnerElo)
	}
	if loserElo != expectedLoserElo {
		t.Fatalf("unexpected loser elo: expected %v, got %v", expectedLoserElo, loserElo)
	}
}

func TestEloComputation20thGameTo39th(t *testing.T) {
	// Given two players of equal elo having played between 20 and 39 games, with a win from zero
	oldWinnerElo := model.Elo{
		CurrentElo: 200.0,
		GamesPlayed: 20,
	}
	oldLoserElo := model.Elo{
		CurrentElo: 200.0,
		GamesPlayed: 39,
	}

	// When computing the elo after the game
    winnerElo, loserElo := everyboard.ComputeNewElos(oldWinnerElo, oldLoserElo, false)

	// Then it should add and remove 20 points to players
	expectedWinnerElo := model.Elo{
		CurrentElo: 220.0,
		GamesPlayed: 21,
	}
	expectedLoserElo := model.Elo{
		CurrentElo: 180.0,
		GamesPlayed: 40,
	}
	if winnerElo != expectedWinnerElo {
		t.Fatalf("unexpected winner elo: expected %v, got %v", expectedWinnerElo, winnerElo)
	}
	if loserElo != expectedLoserElo {
		t.Fatalf("unexpected loser elo: expected %v, got %v", expectedLoserElo, loserElo)
	}
}

func TestEloComputationAfter40thGame(t *testing.T) {
	// Given players at their 40th game, with zero winning the game
	oldWinnerElo := model.Elo{
		CurrentElo: 200.0,
		GamesPlayed: 40,
	}
	oldLoserElo := model.Elo{
		CurrentElo: 200.0,
		GamesPlayed: 40,
	}

	// When computing the elo after the game
    winnerElo, loserElo := everyboard.ComputeNewElos(oldWinnerElo, oldLoserElo, false)

	// Then it should 10 points to winner and remove 10 from loser
	expectedWinnerElo := model.Elo{
		CurrentElo: 210.0,
		GamesPlayed: 41,
	}
	expectedLoserElo := model.Elo{
		CurrentElo: 190.0,
		GamesPlayed: 41,
	}
	if winnerElo != expectedWinnerElo {
		t.Fatalf("unexpected winner elo: expected %v, got %v", expectedWinnerElo, winnerElo)
	}
	if loserElo != expectedLoserElo {
		t.Fatalf("unexpected loser elo: expected %v, got %v", expectedLoserElo, loserElo)
	}
}

func TestEloComputationDoesNotDecreaseBelow100(t *testing.T) {
	// Given two players with 105 elo, and a win from zero
	oldWinnerElo := model.Elo{
		CurrentElo: 105.0,
		GamesPlayed: 5,
	}
	oldLoserElo := model.Elo{
		CurrentElo: 105.0,
		GamesPlayed: 15,
	}

	// When computing the elo after the game
    winnerElo, loserElo := everyboard.ComputeNewElos(oldWinnerElo, oldLoserElo, false)

	// Then it should remove only 5 points to loser so that its elo does not decrease below 105
	expectedWinnerElo := model.Elo{
		CurrentElo: 135.0,
		GamesPlayed: 6,
	}
	expectedLoserElo := model.Elo{
		CurrentElo: 100.0,
		GamesPlayed: 16,
	}
	if winnerElo != expectedWinnerElo {
		t.Fatalf("unexpected winner elo: expected %v, got %v", expectedWinnerElo, winnerElo)
	}
	if loserElo != expectedLoserElo {
		t.Fatalf("unexpected loser elo: expected %v, got %v", expectedLoserElo, loserElo)
	}
}

func TestEloComputationDrawFirstGame(t *testing.T) {
	// Given two players at their first game, and a draw
	emptyElo := model.Elo{
		CurrentElo: 0.0,
		GamesPlayed: 0,
	}

	// When computing the elo after the game
    winnerElo, loserElo := everyboard.ComputeNewElos(emptyElo, emptyElo, true)

	// Then it should give one symbolic elo to both players
	expectedWinnerElo := model.Elo{
		CurrentElo: 1.0,
		GamesPlayed: 1,
	}
	expectedLoserElo := model.Elo{
		CurrentElo: 1.0,
		GamesPlayed: 1,
	}
	if winnerElo != expectedWinnerElo {
		t.Fatalf("unexpected winner elo: expected %v, got %v", expectedWinnerElo, winnerElo)
	}
	if loserElo != expectedLoserElo {
		t.Fatalf("unexpected loser elo: expected %v, got %v", expectedLoserElo, loserElo)
	}
}
