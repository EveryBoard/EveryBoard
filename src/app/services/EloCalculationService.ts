import { Injectable } from '@angular/core';
import { Player } from '../jscaip/Player';
import { Utils } from '../utils/utils';
import { EloInfo } from '../domain/EloInfo';
import { PlayerMap } from '../jscaip/PlayerMap';
import { MGPMap } from 'lib/dist';

export type EloInfoPair = PlayerMap<EloInfo>;

export type EloDifferences = PlayerMap<number>;

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
        const eloInfos: MGPMap<Player, EloInfo> = new MGPMap();
        for (const player of Player.PLAYERS) {
            const currentElo: number =
                EloCalculationService.getActualNewElo(eloEntry.eloInfoPair.get(player).currentElo,
                                                      normalEloDifferences.get(player));
            eloInfos.set(player, {
                currentElo,
                numberOfGamesPlayed: eloEntry.eloInfoPair.get(player).numberOfGamesPlayed + 1,
            });
        }
        return PlayerMap.ofValues(eloInfos.get(Player.ZERO).get(), eloInfos.get(Player.ONE).get());
    }

    /**
      * The normal difference don't take into account that we don't let player lose elo when they're weaker that 100 elo
      */
    public static getNormalEloDifferences(eloEntry: EloEntry): EloDifferences {
        const eloDifferences: PlayerMap<number> = PlayerMap.ofValues(0, 0);
        for (const player of Player.PLAYERS) {
            const playerInfo: EloInfo = eloEntry.eloInfoPair.get(player);
            const K: number = EloCalculationService.getKFrom(playerInfo.numberOfGamesPlayed);
            const W: number = EloCalculationService.getWFrom(eloEntry.winner, player);
            const eloPlayer: number = playerInfo.currentElo;
            const opponentInfo: EloInfo = eloEntry.eloInfoPair.get(player.getOpponent());
            const eloOpponent: number = opponentInfo.currentElo;
            const P: number = this.getWinningProbability(eloPlayer, eloOpponent);
            eloDifferences.put(player, EloCalculationService.getNormalEloDifference(K, W, P));
        }
        return eloDifferences;
    }

    /**
      * Calculate the normal difference of level (excluding special rules)
      * @param K a coefficient depending on how much the player a played game
      * (to make new user grow quicker to their real lever)
      * @param W 1 if player 1, 0.5 if player draw, 0 if player lost
      * @param P The probability player had to win
      * @returns the difference of elo (negative for lost, positive for victory)
      */
    public static getNormalEloDifference(K: number, W: number, P: number): number {
        return K * (W - P);
    }

    /**
      * Calculate the effective change of Elo that will happens
      */
    public static getActualNewElo(oldElo: number, eloDifference: number): number {
        let minimumFinalElo: number = 1;
        if (eloDifference < 0) {
            if (oldElo < 100) {
                eloDifference = 0; // Not removing elo to player below 100
            } else {
                minimumFinalElo = 100; // Not making a player fall back below 100
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

    public static getKFrom(numberOfGamesPlayed: number): number {
        if (numberOfGamesPlayed < 20) {
            return 60;
        } else if (numberOfGamesPlayed < 40) {
            return 40;
        } else {
            return 20;
        }
    }

    public static getWinningProbability(eloWinner: number, eloLoser: number): number {
        const differenceInEloPoints: number = eloWinner - eloLoser;
        const result: number = 1 / (1 + (10 ** (- differenceInEloPoints / 400)));
        return result;
    }

}
