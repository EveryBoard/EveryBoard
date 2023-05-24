/* eslint-disable max-lines-per-function */
import { EloCalculationService, EloDifferences, EloEntry, EloInfoPair } from '../EloCalculationService';

xdescribe('EloCalculationService', () => {
    describe('getNormalEloDifference', () => {
        it('should add less points to weaker player drawing against stronger', () => {
            // Given a match where a weak player win against a stronger
            const playerZeroElo: number = 150;
            const playerOneElo: number = 350;
            const eloEntryWin: EloEntry = {
                eloInfoPair: {
                    playerZero: {
                        currentElo: playerZeroElo,
                        numberOfGamePlayed: 100,
                    },
                    playerOne: {
                        currentElo: playerOneElo,
                        numberOfGamePlayed: 100,
                    },
                },
                winner: 'ZERO',
            };
            // And another match between the same players where they draw
            const eloEntryDraw: EloEntry = {
                eloInfoPair: {
                    playerZero: {
                        currentElo: playerZeroElo,
                        numberOfGamePlayed: 100,
                    },
                    playerOne: {
                        currentElo: playerOneElo,
                        numberOfGamePlayed: 100,
                    },
                },
                winner: 'DRAW',
            };
            // When calculating the two winning/loosing
            const winResult: EloDifferences = EloCalculationService.getNormalEloDifferences(eloEntryWin);
            const drawResult: EloDifferences = EloCalculationService.getNormalEloDifferences(eloEntryDraw);
            // Then the weak player should have win less when drawing
            expect(drawResult.pointChangeForZero).toBeLessThan(winResult.pointChangeForZero);
            // And the strong player should have lost less when drawing
            expect(Math.abs(drawResult.pointChangeForOne)).toBeLessThan(Math.abs(winResult.pointChangeForOne));
        });
        it('should add thrice as much point when you have twice as big K', () => {
            // Given a player with less than 20 games, hence a K of 60,
            // Winning againt wit more than 40 games, hence a K of 20,  with the same Elo
            const eloEntry: EloEntry = {
                eloInfoPair: {
                    playerZero: {
                        currentElo: 200,
                        numberOfGamePlayed: 10,
                    },
                    playerOne: {
                        currentElo: 200,
                        numberOfGamePlayed: 100,
                    },
                },
                winner: 'ZERO',
            };
            // When calculating the two winnings/loosings
            const eloResult: EloDifferences = EloCalculationService.getNormalEloDifferences(eloEntry);

            // Then the point won by the big K should be thrice as much as the one with the small K
            // hence 20 and 10 since they're on the same level
            expect(eloResult).toEqual({
                pointChangeForZero: 30,
                pointChangeForOne: -10,
            });
        });
        it('should make the win/loose proportional to the difference in elo (at equal K)', () => {
            // Given two set of players with all the same K
            // and with each set having the looser 100 elo bellow its opponent
            // but one set being for higher in elo
            const lowEloEntry: EloEntry = {
                eloInfoPair: {
                    playerZero: {
                        currentElo: 100,
                        numberOfGamePlayed: 100,
                    },
                    playerOne: {
                        currentElo: 200,
                        numberOfGamePlayed: 100,
                    },
                },
                winner: 'ZERO',
            };
            const highEloEntry: EloEntry = {
                eloInfoPair: {
                    playerZero: {
                        currentElo: 800,
                        numberOfGamePlayed: 100,
                    },
                    playerOne: {
                        currentElo: 900,
                        numberOfGamePlayed: 100,
                    },
                },
                winner: 'ZERO',
            };
            // When comparing the wins and losts
            const lowEloResult: EloDifferences = EloCalculationService.getNormalEloDifferences(lowEloEntry);
            const highEloResult: EloDifferences = EloCalculationService.getNormalEloDifferences(highEloEntry);

            // Then they should be the same
            // aka: the chance of winning of 100 against 200 are N
            //      the chance of winning og 800 against 900 should also be N
            expect(lowEloResult).toEqual(highEloResult);
        });
    });
    describe('getNewElos', () => {
        it('should not deduce elo to a Player.ZERO bellow 100', () => {
            // Given a Player.ZERO with less than 100 elo loose against
            // a Player.ONE with elo more than 100
            const eloEntry: EloEntry = {
                eloInfoPair: {
                    playerZero: {
                        currentElo: 50,
                        numberOfGamePlayed: 100,
                    },
                    playerOne: {
                        currentElo: 150,
                        numberOfGamePlayed: 100,
                    },
                },
                winner: 'ONE',
            };

            // When calculating the two winning/loosing
            const eloResult: EloInfoPair = EloCalculationService.getNewElos(eloEntry);

            // Then zero should loose 0 elo
            expect(eloResult.playerZero.currentElo).toEqual(eloEntry.eloInfoPair.playerZero.currentElo);
        });
        it('should not deduce elo to a Player.ONE bellow 100', () => {
            // Given a Player.ONE with less than 100 elo loosing against
            // a Player.ZERO with elo more than 100
            const eloEntry: EloEntry = {
                eloInfoPair: {
                    playerZero: {
                        currentElo: 150,
                        numberOfGamePlayed: 100,
                    },
                    playerOne: {
                        currentElo: 50,
                        numberOfGamePlayed: 100,
                    },
                },
                winner: 'ZERO',
            };
            // When calculating the two winning/loosing
            const eloResult: EloInfoPair = EloCalculationService.getNewElos(eloEntry);

            // Then one should loose 0 elo
            expect(eloResult.playerOne.currentElo).toEqual(eloEntry.eloInfoPair.playerOne.currentElo);
        });
        it('should give a symbolic elo point when loosing your first part', () => {
            // Given a player with a 0 elo loosing
            const eloEntry: EloEntry = {
                eloInfoPair: {
                    playerZero: {
                        currentElo: 0,
                        numberOfGamePlayed: 0, // The user is at its first game
                    },
                    playerOne: {
                        currentElo: 150,
                        numberOfGamePlayed: 100,
                    },
                },
                winner: 'ONE',
            };

            // When calculating the win and lost
            const eloResult: EloInfoPair = EloCalculationService.getNewElos(eloEntry);

            // Then the player should still win 1 elo
            expect(eloResult.playerZero.currentElo).toEqual(1);
        });
        it('should not make looser go bellow 100 elo when looser was over 100 elo', () => {
            // Given a player slightly over 100 loosing againt
            // another player of the same level and K
            const eloEntry: EloEntry = {
                eloInfoPair: {
                    playerZero: {
                        currentElo: 105,
                        numberOfGamePlayed: 100,
                    },
                    playerOne: {
                        currentElo: 105,
                        numberOfGamePlayed: 100,
                    },
                },
                winner: 'ONE',
            };
            // When calculating the two winnings/loosings
            const eloResult: EloInfoPair = EloCalculationService.getNewElos(eloEntry);
            // Then the lost point should make the looser go to 100 but not bellow
            expect(eloResult.playerZero.currentElo).toEqual(100);
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
