/* eslint-disable max-lines-per-function */
import { EloCalculationService, EloDifferences, EloEntry, EloInfoPair } from '../EloCalculationService';

xdescribe('EloCalculationService', () => {
    describe('getNormalEloDifference', () => {
        it('should add less points to weaker player drawing against stronger', () => {
            // Given a match where a weak player wins against a stronger
            const playerZeroElo: number = 150;
            const playerOneElo: number = 350;
            const eloEntryWin: EloEntry = {
                eloInfoPair: [{
                    currentElo: playerZeroElo,
                    numberOfGamePlayed: 100,
                }, {
                    currentElo: playerOneElo,
                    numberOfGamePlayed: 100,
                }],
                winner: 'ZERO',
            };
            // And another match between the same players where they draw
            const eloEntryDraw: EloEntry = {
                eloInfoPair: [{
                    currentElo: playerZeroElo,
                    numberOfGamePlayed: 100,
                }, {
                    currentElo: playerOneElo,
                    numberOfGamePlayed: 100,
                }],
                winner: 'DRAW',
            };
            // When calculating the two winning/losing
            const winResult: EloDifferences = EloCalculationService.getNormalEloDifferences(eloEntryWin);
            const drawResult: EloDifferences = EloCalculationService.getNormalEloDifferences(eloEntryDraw);
            // Then the weak player should have win less when drawing
            expect(drawResult[0]).toBeLessThan(winResult[0]);
            // And the strong player should have lost less when drawing
            expect(Math.abs(drawResult[1])).toBeLessThan(Math.abs(winResult[1]));
        });
        it('should add thrice as much point when you have twice as big K', () => {
            // Given a player with less than 20 games, hence a K of 60,
            // Winning againt with more than 40 games, hence a K of 20, with the same Elo
            const eloEntry: EloEntry = {
                eloInfoPair: [{
                    currentElo: 200,
                    numberOfGamePlayed: 10,
                }, {
                    currentElo: 200,
                    numberOfGamePlayed: 100,
                }],
                winner: 'ZERO',
            };
            // When calculating the two winnings/losings
            const eloResult: EloDifferences = EloCalculationService.getNormalEloDifferences(eloEntry);

            // Then the point won by the big K should be thrice as much as the one with the small K
            // hence 20 and 10 since they're on the same level
            expect(eloResult).toEqual([30, -10]);
        });
        it('should make the win/lose proportional to the difference in elo (at equal K)', () => {
            // Given two set of players with all the same K
            // and with each set having the loser 100 elo below its opponent
            // but one set being for higher in elo
            const lowEloEntry: EloEntry = {
                eloInfoPair: [{
                    currentElo: 100,
                    numberOfGamePlayed: 100,
                }, {
                    currentElo: 200,
                    numberOfGamePlayed: 100,
                }],
                winner: 'ZERO',
            };
            const highEloEntry: EloEntry = {
                eloInfoPair: [{
                    currentElo: 800,
                    numberOfGamePlayed: 100,
                }, {
                    currentElo: 900,
                    numberOfGamePlayed: 100,
                }],
                winner: 'ZERO',
            };
            // When comparing the wins and losts
            const lowEloResult: EloDifferences = EloCalculationService.getNormalEloDifferences(lowEloEntry);
            const highEloResult: EloDifferences = EloCalculationService.getNormalEloDifferences(highEloEntry);

            // Then they should be the same
            // i.e.: the chance of winning of 100 against 200 are N
            //      the chance of winning og 800 against 900 should also be N
            expect(lowEloResult).toEqual(highEloResult);
        });
    });
    describe('getNewElos', () => {
        it('should not deduce elo to a Player.ZERO below 100', () => {
            // Given a Player.ZERO with less than 100 elo lose against
            // a Player.ONE with elo more than 100
            const eloEntry: EloEntry = {
                eloInfoPair: [{
                    currentElo: 50,
                    numberOfGamePlayed: 100,
                }, {
                    currentElo: 150,
                    numberOfGamePlayed: 100,
                }],
                winner: 'ONE',
            };

            // When calculating the two winning/losing
            const eloResult: EloInfoPair = EloCalculationService.getNewElos(eloEntry);

            // Then zero should lose 0 elo
            expect(eloResult[0].currentElo).toEqual(eloEntry.eloInfoPair[0].currentElo);
        });
        it('should not deduce elo to a Player.ONE below 100', () => {
            // Given a Player.ONE with less than 100 elo losing against
            // a Player.ZERO with elo more than 100
            const eloEntry: EloEntry = {
                eloInfoPair: [{
                    currentElo: 150,
                    numberOfGamePlayed: 100,
                }, {
                    currentElo: 50,
                    numberOfGamePlayed: 100,
                }],
                winner: 'ZERO',
            };
            // When calculating the two winning/losing
            const eloResult: EloInfoPair = EloCalculationService.getNewElos(eloEntry);

            // Then one should lose 0 elo
            expect(eloResult[1].currentElo).toEqual(eloEntry.eloInfoPair[1].currentElo);
        });
        it('should give a symbolic elo point when losing your first part', () => {
            // Given a player with a 0 elo losing
            const eloEntry: EloEntry = {
                eloInfoPair: [{
                    currentElo: 0,
                    numberOfGamePlayed: 0, // The user is at its first game
                }, {
                    currentElo: 150,
                    numberOfGamePlayed: 100,
                }],
                winner: 'ONE',
            };

            // When calculating the win and lost
            const eloResult: EloInfoPair = EloCalculationService.getNewElos(eloEntry);

            // Then the player should still win 1 elo
            expect(eloResult[0].currentElo).toEqual(1);
        });
        it('should not make loser go below 100 elo when loser was over 100 elo', () => {
            // Given a player slightly over 100 losing againt
            // another player of the same level and K
            const eloEntry: EloEntry = {
                eloInfoPair: [{
                    currentElo: 105,
                    numberOfGamePlayed: 100,
                }, {
                    currentElo: 105,
                    numberOfGamePlayed: 100,
                }],
                winner: 'ONE',
            };
            // When calculating the two winnings/losings
            const eloResult: EloInfoPair = EloCalculationService.getNewElos(eloEntry);
            // Then the lost point should make the loser go to 100 but not below
            expect(eloResult[0].currentElo).toEqual(100);
        });
    });
    describe('getWinningProbability', () => {
        it('should be 0.5 for player the same level', () => {
            expect(EloCalculationService.getWinningProbability(100, 100)).toEqual(0.5);
        });
        it('should be equal for two different pair of elo of equal difference', () => {
            const lowElos: number = EloCalculationService.getWinningProbability(100, 200);
            const highElos: number = EloCalculationService.getWinningProbability(1100, 1200);
            expect(lowElos).toEqual(highElos);
        });
    });
});
