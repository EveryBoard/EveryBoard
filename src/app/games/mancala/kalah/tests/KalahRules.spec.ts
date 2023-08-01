/* eslint-disable max-lines-per-function */
import { Minimax } from 'src/app/jscaip/Minimax';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { KalahMove } from '../KalahMove';
import { KalahRules } from '../KalahRules';
import { KalahDummyMinimax } from '../KalahDummyMinimax';
import { MancalaDistribution } from '../../commons/MancalaMove';
import { MancalaState } from '../../commons/MancalaState';
import { Table } from 'src/app/utils/ArrayUtils';
import { Rules } from 'src/app/jscaip/Rules';
import { DoMancalaRulesTests } from '../../commons/GenericMancalaRulesTest.spec';

describe('KalahRules', () => {

    const rules: Rules<KalahMove, MancalaState> = KalahRules.get();

    const minimaxes: Minimax<KalahMove, MancalaState>[] = [
        new KalahDummyMinimax(),
    ];
    describe('generic tests', () => {
        DoMancalaRulesTests({
            gameName: 'Kalah',
            minimaxes,
            rules,
            simpleMove: KalahMove.of(MancalaDistribution.FIVE),
        });
    });
    describe('distribution', () => {
        it('should allow simple move', () => {
            // Given any board
            const state: MancalaState = MancalaState.getInitialState();

            // When doing a simple move
            const move: KalahMove = KalahMove.of(MancalaDistribution.FIVE);

            // Then the seed should be distributed
            const expectedBoard: Table<number> = [
                [4, 4, 4, 4, 4, 4],
                [4, 5, 5, 5, 5, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 1, [0, 0]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should feed initial house', () => {
            // Given a board where one house of current player is full enough to feed itself
            const state: MancalaState = new MancalaState([
                [0, 0, 0, 0, 0, 0],
                [13, 0, 0, 0, 0, 0],
            ], 0, [0, 0]);

            // When doing a simple move
            const move: KalahMove = KalahMove.of(MancalaDistribution.ZERO);

            // Then the seed should be distributed (and then by default that means a capture)
            const expectedBoard: Table<number> = [
                [0, 1, 1, 1, 1, 1],
                [0, 1, 1, 1, 1, 1],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 1, [3, 0]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should allow to distribute twice when first landing end up in the kalah', () => {
            // Given a move with the first sub-move landing in the kalah
            const state: MancalaState = MancalaState.getInitialState();

            // When doing the double distribution
            const move: KalahMove = KalahMove.of(MancalaDistribution.THREE, [MancalaDistribution.FIVE]);

            // Then two distributiong must have been done and one piece dropped in the kalah
            const expectedBoard: Table<number> = [
                [4, 4, 4, 4, 4, 4],
                [5, 6, 6, 1, 5, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 1, [1, 0]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should throw when distributing twice when first landing did not end in the kalah', () => {
            // Given a double distribution with the first one not landing in the kalah
            const state: MancalaState = MancalaState.getInitialState();

            // When doing the double distribution
            const move: KalahMove = KalahMove.of(MancalaDistribution.ONE, [MancalaDistribution.TWO]);

            // Then the move should be wildly considered as illegal, you scumbag hacker !
            const reason: string = 'CANNOT_PLAY_AFTER_NON_KALAH_MOVE';
            RulesUtils.expectToThrowAndLog(() => {
                RulesUtils.expectMoveFailure(rules, state, move, reason);
            }, reason);
        });
        it('should drop a piece in your kalah when passing by', () => {
            // Given any move going further than your last house
            const state: MancalaState = MancalaState.getInitialState();

            // When doing it
            const move: KalahMove = KalahMove.of(MancalaDistribution.ZERO);

            // Then one of your seeds would be dropped in your kalah
            // YEAH YOU READ THAT RIGHT, UP YOURS !!
            const expectedBoard: Table<number> = [
                [5, 5, 5, 4, 4, 4],
                [0, 4, 4, 4, 4, 4],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 1, [1, 0]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it(`should not drop a piece in opponent's kalah when passing by`, () => {
            // Given any move going further than your last house, and than last opponent's house
            const board: Table<number> = [
                [4, 4, 4, 4, 4, 4],
                [8, 4, 4, 4, 4, 4],
            ];
            const state: MancalaState = new MancalaState(board, 0, [0, 0]);

            // When doing it
            const move: KalahMove = KalahMove.of(MancalaDistribution.ZERO);

            // Then one of your seeds would be dropped in your kalah but not in the opponent's
            const expectedBoard: Table<number> = [
                [5, 5, 5, 5, 5, 5],
                [0, 4, 4, 4, 4, 5],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 1, [1, 0]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should forbid to stop distributing after landing in your kalah', () => {
            // Given a simple distribution ending in the kalah
            const state: MancalaState = MancalaState.getInitialState();

            // When doing the move
            const move: KalahMove = KalahMove.of(MancalaDistribution.THREE);

            // Then it should be refused
            const reason: string = 'MUST_CONTINUE_PLAYING_AFTER_KALAH_MOVE';
            RulesUtils.expectToThrowAndLog(() => {
                RulesUtils.expectMoveFailure(rules, state, move, reason);
            }, reason);
        });
        it('should allow to pass by kalah several time', () => {
            // Given a board where you could pass by kalah five times
            const state: MancalaState = new MancalaState([
                [0, 0, 1, 9, 0, 0],
                [1, 1, 4, 1, 5, 4],
            ], 10, [13, 9]);

            // When doing that complex move
            const move: KalahMove =
            KalahMove.of(MancalaDistribution.ZERO,
                         [
                             MancalaDistribution.FOUR,
                             MancalaDistribution.ZERO,
                             MancalaDistribution.ONE,
                             MancalaDistribution.ZERO,
                             MancalaDistribution.FIVE,
                         ]);

            // Then it should be legal
            const expectedState: MancalaState = new MancalaState([
                [0, 0, 1, 9, 0, 0],
                [0, 1, 6, 3, 1, 0],
            ], 11, [18, 9]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should allow to stop distribution in the kalah when no more piece available', () => {
            // Given a move where current player has no more non-kalah sub-moves
            const state: MancalaState = new MancalaState([
                [0, 0, 1, 9, 0, 0],
                [1, 0, 0, 0, 0, 0],
            ], 10, [13, 9]);

            // When doing the only move possible for the remaining sub-move
            const move: KalahMove = KalahMove.of(MancalaDistribution.ZERO);

            // Then that normally-illegal move should be accepted
            const expectedState: MancalaState = new MancalaState([
                [0, 0, 1, 9, 0, 0],
                [0, 0, 0, 0, 0, 0],
            ], 11, [14, 9]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
    });
    describe('starvation and mansoon', () => {
        it('should allow to starve opponent and mansoon immediately', () => {
            // Given a board where the opponent cannot play
            const board: Table<number> = [
                [0, 0, 0, 0, 0, 0],
                [1, 0, 0, 1, 0, 1],
            ];
            const state: MancalaState = new MancalaState(board, 0, [22, 23]);

            // When doing a move not feeding the opponent
            const move: KalahMove = KalahMove.of(MancalaDistribution.THREE);

            // Then your move should capture all pieces
            const expectedBoard: Table<number> = [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 1, [25, 23]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
    });
    describe('captures', () => {
        it(`should capture parallel opponent's house when landing in your own territory on an empty house`, () => {
            // Given a board with an opponent's house full of seeds and your paralel house being empty
            const board: Table<number> = [
                [4, 4, 4, 4, 4, 4],
                [0, 0, 0, 0, 2, 0],
            ];
            const state: MancalaState = new MancalaState(board, 4, [0, 0]);

            // When doing a move that end up in this house of your
            const move: KalahMove = KalahMove.of(MancalaDistribution.FOUR);

            // Then you should capture both houses
            const expectedBoard: Table<number> = [
                [4, 4, 0, 4, 4, 4],
                [0, 0, 0, 1, 0, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 5, [5, 0]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it(`should not capture parallel opponent's house when landing in an occupied house of yours`, () => {
            // Given a board with an opponent's house full of seeds and your paralel house being empty
            const board: Table<number> = [
                [4, 4, 4, 4, 4, 4],
                [0, 0, 1, 0, 2, 0],
            ];
            const state: MancalaState = new MancalaState(board, 4, [0, 0]);

            // When doing a move that end up in this house of yours but after doing a full turn first
            const move: KalahMove = KalahMove.of(MancalaDistribution.FOUR);

            // Then you should not capture anything
            const expectedBoard: Table<number> = [
                [4, 4, 4, 4, 4, 4],
                [0, 0, 2, 1, 0, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 5, [0, 0]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should capture when landing on empty space inside your territory', () => {
            // Given a board with possible capture
            const board: Table<number> = [
                [0, 0, 0, 1, 0, 7],
                [8, 0, 0, 1, 0, 0],
            ];
            const state: MancalaState = new MancalaState(board, 0, [0, 0]);

            // When doing the move
            const move: KalahMove = KalahMove.of(MancalaDistribution.ZERO);

            // Then the capture should be done too
            const expectedBoard: Table<number> = [
                [1, 1, 1, 2, 1, 0],
                [0, 0, 0, 1, 0, 0],
            ];
            const expectedState: MancalaState = new MancalaState(expectedBoard, 1, [10, 0]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should allow long capture', () => {
            // Given a board where you could pass by kalah five times
            const state: MancalaState = new MancalaState([
                [0, 0, 1, 9, 0, 0],
                [1, 2, 3, 0, 0, 0],
            ], 0, [0, 0]);

            // When doing that complex move
            const move: KalahMove =
            KalahMove.of(MancalaDistribution.ZERO,
                         [
                             MancalaDistribution.ONE,
                             MancalaDistribution.ZERO,
                             MancalaDistribution.TWO,
                             MancalaDistribution.ZERO,
                             MancalaDistribution.ONE,
                         ]);

            // Then it should be legal
            const expectedState: MancalaState = new MancalaState([
                [0, 0, 1, 9, 0, 0],
                [1, 0, 0, 0, 0, 0],
            ], 1, [5, 0]);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
    });
});
