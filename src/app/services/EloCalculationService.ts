import { Injectable } from '@angular/core';
import { Player } from '../jscaip/Player';
import { Utils } from '../utils/utils';
import { EloInfo } from '../domain/EloInfo';

export interface EloInfoPair {
    playerZero: EloInfo,
    playerOne: EloInfo,
}

export interface EloDifferences {
    pointChangeForZero: number,
    pointChangeForOne: number,
}

export interface EloEntry {
    eloInfoPair: EloInfoPair,
    winner: 'ZERO' | 'ONE' | 'DRAW',
}

@Injectable({
    providedIn: 'root',
})
export class EloCalculationService {

    public static getNewElos(eloEntry: EloEntry): EloInfoPair {
        const normalEloDifferences: EloDifferences = EloCalculationService.getNormalEloDifferences(eloEntry);
        const zeroNewElo: number = EloCalculationService.getActualNewElo(eloEntry.eloInfoPair.playerZero.currentElo,
                                                                         normalEloDifferences.pointChangeForZero);
        const oneNewElo: number = EloCalculationService.getActualNewElo(eloEntry.eloInfoPair.playerOne.currentElo,
                                                                        normalEloDifferences.pointChangeForOne);
        return {
            playerZero: {
                currentElo: zeroNewElo,
                numberOfGamePlayed: eloEntry.eloInfoPair.playerZero.numberOfGamePlayed + 1,
            },
            playerOne: {
                currentElo: oneNewElo,
                numberOfGamePlayed: eloEntry.eloInfoPair.playerOne.numberOfGamePlayed + 1,
            },
        };
    }
    public static getNormalEloDifferences(eloEntry: EloEntry): EloDifferences {
        const wZero: number = EloCalculationService.getWFrom(eloEntry.winner, Player.ZERO);
        const wOne: number = EloCalculationService.getWFrom(eloEntry.winner, Player.ONE);
        const playerZeroInfo: EloInfo = eloEntry.eloInfoPair.playerZero;
        const playerOneInfo: EloInfo = eloEntry.eloInfoPair.playerOne;
        const eloZero: number = playerZeroInfo.currentElo;
        const eloOne: number = eloEntry.eloInfoPair.playerOne.currentElo;
        const pZero: number = this.getWinningProbability(eloZero, eloOne);
        const pOne: number = this.getWinningProbability(eloOne, eloZero);
        const playerZeroK: number = EloCalculationService.getKFrom(playerZeroInfo.numberOfGamePlayed);
        const playerOneK: number = EloCalculationService.getKFrom(playerOneInfo.numberOfGamePlayed);
        return {
            pointChangeForZero: EloCalculationService.getNormalEloDifference(playerZeroK, wZero, pZero),
            pointChangeForOne: EloCalculationService.getNormalEloDifference(playerOneK, wOne, pOne),
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
    public static getKFrom(numberOfGamePlayed: number): number {
        if (numberOfGamePlayed < 20) {
            return 60;
        } else if (numberOfGamePlayed < 40) {
            return 40;
        } else {
            return 20;
        }
    }
    public static getWinningProbability(eloWinner: number, eloLooser: number): number {
        const diffEnElo: number = eloWinner - eloLooser;
        const result: number = 1 / (1 + (10 ** (-diffEnElo / 400)));
        return result;
    }
}
