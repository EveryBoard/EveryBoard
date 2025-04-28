package internal

import (
	"math"

	model "github.com/EveryBoard/EveryBoard/internal/model"
)

type EndType int
const (
	Victory EndType = iota
	Draw
	Loss
)

func w(end EndType) float64 {
	switch end {
	case Draw: return 0.5
	case Victory: return 1
	default: return 0
	}
}

func k(gamesPlayed uint) float64 {
	if gamesPlayed < 20 {
		return 60.
	} else if gamesPlayed < 40 {
		return 40.
	} else {
		return 20.
	}
}

func winProbability(eloOfWinner float64, eloOfLoser float64) float64 {
	eloDifference := eloOfWinner - eloOfLoser
	return 1 / (1 + (math.Pow(10, - eloDifference / 400)))
}

func standardEloDifference(k float64, w float64, p float64) float64 {
	return k * (w - p)
}

func newEloValue(oldEloValue float64, difference float64) float64 {
	if difference <= 0.0 {
		// Player loses
		if oldEloValue == 0.0 {
			return 1.0 // Losing their first match, they win 1 elo
		} else if oldEloValue <= 100.0 {
			return oldEloValue // They don't lose elo if they are below 100
		} else {
			// Otherwise, they can't go below 100
			return math.Max(100.0, oldEloValue + difference)
		}
	} else {
		return oldEloValue + difference
	}
}

func computeNewElo(oldElo model.Elo, oldOpponentElo model.Elo, end EndType) model.Elo {
	k := k(oldElo.GamesPlayed)
	w := w(end)
	p := winProbability(oldElo.CurrentElo, oldOpponentElo.CurrentElo)
	return model.Elo{
		CurrentElo: newEloValue(oldElo.CurrentElo, standardEloDifference(k, w, p)),
		GamesPlayed: oldElo.GamesPlayed + 1,
	}
}


func computeAndUpdateElos(gameName string, winner *model.MinimalUser, loser *model.MinimalUser, draw bool) error {
	winnerElo, loserElo, err := model.GetElos(gameName, winner, loser)
	if err != nil {
		return err
	}
	winnerEnd := Victory
	loserEnd := Loss
	if draw {
		winnerEnd = Draw
		loserEnd = Draw
	}
	newEloWinner := computeNewElo(*winnerElo, *loserElo, winnerEnd)
	newEloLoser := computeNewElo(*loserElo, *winnerElo, loserEnd)

	return model.UpdateElos(gameName, winner, newEloWinner, loser, newEloLoser)
}
