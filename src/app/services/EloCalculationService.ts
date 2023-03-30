import { Injectable } from '@angular/core';
import { Player } from '../jscaip/Player';
import { Utils } from '../utils/utils';

export interface EloResult {
    newEloForZero: number,
    newEloForOne: number,
}

export interface EloDifferences {
    pointChangeForZero: number,
    pointChangeForOne: number,
}

export interface EloEntry {
    playerZeroElo: number,
    playerOneElo: number,
    playerZeroK: number,
    playerOneK: number,
    winner: 'ZERO' | 'ONE' | 'DRAW',
}

@Injectable({
    providedIn: 'root',
})
export class EloCalculationService {

    public static getNewElos(eloEntry: EloEntry): EloResult {
        const normalEloDifferences: EloDifferences = EloCalculationService.getNormalEloDifferences(eloEntry);
        return {
            newEloForZero: EloCalculationService.getActualNewElo(eloEntry.playerZeroElo,
                                                                 normalEloDifferences.pointChangeForZero),
            newEloForOne: EloCalculationService.getActualNewElo(eloEntry.playerOneElo,
                                                                normalEloDifferences.pointChangeForOne),
        };
    }
    public static getNormalEloDifferences(eloEntry: EloEntry): EloDifferences {
        const wZero: number = EloCalculationService.getWFrom(eloEntry.winner, Player.ZERO);
        const wOne: number = EloCalculationService.getWFrom(eloEntry.winner, Player.ONE);
        console.log(wZero, wOne)
        const pZero: number = 0.25; // this.getWinningProbability(eloEntry.playerZeroElo, eloEntry.playerOneElo);
        const pOne: number = 0.75; // this.getWinningProbability(eloEntry.playerOneElo, eloEntry.playerZeroElo);
        return {
            pointChangeForZero: EloCalculationService.getNormalEloDifference(eloEntry.playerZeroK, wZero, pZero),
            pointChangeForOne: EloCalculationService.getNormalEloDifference(eloEntry.playerOneK, wOne, pOne),
        };
    }
    public static getNormalEloDifference(K: number, W: number, P: number): number {
        return K * (W - P);
    }
    public static getActualNewElo(oldElo: number, eloDifference: number): number {
        let minimumFinalElo: number = 1;
        if (eloDifference < 0) {
            if (oldElo < 100) {
                eloDifference = 0; // Not removing elo to player bellow 100
            } else {
                minimumFinalElo = 100; // Not making a player fall back bellow 100
            }
        }
        const newElo: number = oldElo + eloDifference;
        return Math.max(minimumFinalElo, newElo);
    }
    public static getWFrom(winner: 'ZERO' | 'ONE' | 'DRAW', player: Player): number {
        if (winner === 'DRAW') {
            return 0.5;
        } else if (winner === 'ZERO') {
            if (player === Player.ZERO) {
                return 1;
            } else {
                return 0;
            }
        } else {
            Utils.expectToBe(winner, 'ONE');
            if (player === Player.ONE) {
                return 1;
            } else {
                return 0;
            }
        }
    }
    public static getWinningProbability(eloWinner: number, eloLooser: number): number {
        const diffEnElo: number = eloWinner - eloLooser;
        const result: number = 1 / (1 + (10 ** (-diffEnElo / 400)));
        return result;
    }
}
