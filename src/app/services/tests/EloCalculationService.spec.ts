/* eslint-disable max-lines-per-function */
import { EloCalculationService, EloDifferences, EloEntry, EloResult } from '../EloCalculationService';

fdescribe('EloCalculationService', () => {
    describe('josianne', () => {
        it('should not deduce elo to a Player.ZERO bellow 100', () => {
            // Given a Player.ZERO with less than 100 elo loose against
            // a Player.ONE with elo more than 100
            const eloEntry: EloEntry = {
                // Relevant for the test
                playerZeroElo: 50,
                winner: 'ONE',
                // Irrelevant for the test
                playerOneElo: 150,
                playerOneK: 40,
                playerZeroK: 20,
            };

            // When calculating the two winning/loosing
            const eloResult: EloResult = EloCalculationService.getNewElos(eloEntry);

            // Then zero should loose 0 elo
            expect(eloResult.newEloForZero).toEqual(eloEntry.playerZeroElo);
        });
        it('should not deduce elo to a Player.ONE bellow 100', () => {
            // Given a Player.ONE with less than 100 elo loosing against
            // a Player.ZERO with elo more than 100
            const eloEntry: EloEntry = {
                // Relevant for the test
                playerOneElo: 50,
                winner: 'ZERO',
                // Irrelevant for the test
                playerZeroElo: 150,
                playerOneK: 40,
                playerZeroK: 20,
            };
            // When calculating the two winning/loosing
            const eloResult: EloResult = EloCalculationService.getNewElos(eloEntry);

            // Then one should loose 0 elo
            expect(eloResult.newEloForOne).toEqual(eloEntry.playerOneElo);
        });
        fit('should deduce loose half points to weaker player drawing against stronger', () => {
            // Given a match where a weak player win against
            // a strong
            const playerZeroElo: number = 150;
            const playerOneElo: number = 350;
            const eloEntryWin: EloEntry = {
                playerZeroElo,
                winner: 'ZERO',
                playerOneElo,
                playerOneK: 20,
                playerZeroK: 20,
            };
            // And another match between the same players where they draw
            const eloEntryDraw: EloEntry = {
                playerZeroElo,
                winner: 'DRAW',
                playerOneElo,
                playerOneK: 20,
                playerZeroK: 20,
            };
            // When calculating the two winning/loosing
            console.log('win')
            const winResult: EloDifferences = EloCalculationService.getNormalEloDifferences(eloEntryWin);
            console.log('draw')
            const drawResult: EloDifferences = EloCalculationService.getNormalEloDifferences(eloEntryDraw);
            const strengthZero: number = EloCalculationService.getWinningProbability(playerZeroElo, playerOneElo);
            const strengthOne: number = EloCalculationService.getWinningProbability(playerOneElo, playerZeroElo);
            const strengthRatio: number = strengthOne / strengthZero;
            // Then the weak player should have win twice as less when drawing
            expect(winResult.pointChangeForZero).toEqual(strengthRatio * drawResult.pointChangeForZero);
            // And the strong player should have lost twice as less when drawing
            expect(winResult.pointChangeForOne).toEqual(strengthRatio * drawResult.pointChangeForOne);
        });
        it('should add twice as much point when you have twice as big K', () => {
            // Given a player with a K of 40 (hence, that player is on one of its 30 first game)
            // Winning againt a player with a K of 20 (normal player) with the same Elo
            const eloEntry: EloEntry = {
                playerZeroElo: 200,
                playerZeroK: 40,

                playerOneElo: 200,
                playerOneK: 20,

                winner: 'ZERO',
            };
            // When calculating the two winnings/loosings
            const eloResult: EloDifferences = EloCalculationService.getNormalEloDifferences(eloEntry);

            // Then the point won by the big K should be twice as much as the one with the small K
            // hence 20 and 10 since they're on the same level
            expect(eloResult).toEqual({
                pointChangeForZero: 20,
                pointChangeForOne: -10,
            });
        });
        it('should make the win/loose proportional to the difference in elo (at equal K)', () => {
            // Given two set of players with all the same K
            // and with each set having the looser 100 elo bellow its opponent
            // but one set being for higher in elo
            const lowEloEntry: EloEntry = {
                playerZeroElo: 100,
                winner: 'ZERO',
                playerOneElo: 200,
                playerOneK: 20,
                playerZeroK: 20,
            };
            const highEloEntry: EloEntry = {
                playerZeroElo: 800,
                winner: 'ZERO',
                playerOneElo: 900,
                playerOneK: 20,
                playerZeroK: 20,
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
        it('should give a symbolic elo point when loosing your first part', () => {
            // Given a player with a 0 elo loosing
            const eloEntry: EloEntry = {
                // Relevant for the test
                playerZeroElo: 0,
                winner: 'ONE',
                // Irrelevant for the test
                playerOneElo: 150,
                playerOneK: 40,
                playerZeroK: 20,
            };

            // When calculating the win and lost
            const eloResult: EloResult = EloCalculationService.getNewElos(eloEntry);

            // Then the player should still win 1 elo
            expect(eloResult.newEloForZero).toEqual(1);
        });
        it('should not make looser go bellow 100 elo when looser was over 100 elo', () => {
            // Given a player slightly over 100 loosing againt
            // another player of the same level and K
            const eloEntry: EloEntry = {
                playerZeroElo: 105,
                playerOneElo: 105,
                playerZeroK: 20,
                playerOneK: 20,
                winner: 'ONE',
            };
            // When calculating the two winnings/loosings
            const eloResult: EloResult = EloCalculationService.getNewElos(eloEntry);
            // Then the lost point should make the looser go to 100 but not bellow
            expect(eloResult).toEqual({
                newEloForZero: 100,
                newEloForOne: 115,
            });
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
