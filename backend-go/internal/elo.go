package internal

import (
	"math"
	"gorm.io/gorm"
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

func computeNewElo(oldElo Elo, oldOpponentElo Elo, end EndType) Elo {
	k := k(oldElo.GamesPlayed)
	w := w(end)
	p := winProbability(oldElo.CurrentElo, oldOpponentElo.CurrentElo)
	return Elo{
		CurrentElo: newEloValue(oldElo.CurrentElo, standardEloDifference(k, w, p)),
		GamesPlayed: oldElo.GamesPlayed + 1,
	}
}

func UpdateElo(tx *gorm.DB, gameName string, user *MinimalUser, elo Elo) error {
	return tx.Model(&Elo{}).Where("game_name = ? and user_id = ?", gameName, user.ID).Updates(elo).Error
}

func GetElos(gameName string, winner *MinimalUser, loser *MinimalUser) (*Elo, *Elo, error) {
	// TODO: do this through a transaction
	eloWinner, err := GetElo(gameName, winner)
	if err != nil {
		return nil, nil, err
	}

	eloLoser, err := GetElo(gameName, loser)
	if err != nil {
		return nil, nil, err
	}
	return eloWinner, eloLoser, nil
}

func ComputeAndUpdateElos(gameName string, winner *MinimalUser, loser *MinimalUser, draw bool) error {
	winnerElo, loserElo, err := GetElos(gameName, winner, loser)
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

	tx := db.Begin()
	err = UpdateElo(tx, gameName, winner, newEloWinner)
	if err != nil {
		tx.Rollback()
		return err
	}
	err = UpdateElo(tx, gameName, loser, newEloLoser)
	if err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit().Error
}
