/* eslint-disable max-lines-per-function */
import { Minimax } from 'src/app/jscaip/Minimax';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { KalahMove } from '../KalahMove';
import { KalahNode, KalahRules } from '../KalahRules';
import { KalahDummyMinimax } from '../KalahDummyMinimax';
import { MancalaMove } from '../../MancalaMove';
import { MancalaState } from '../../MancalaState';
import { Table } from 'src/app/utils/ArrayUtils'
import { KalahFailure } from '../KalahFailure';
import { Rules } from 'src/app/jscaip/Rules';
import { Player } from 'src/app/jscaip/Player';

fdescribe('KalahRules', () => {

    let rules: Rules<KalahMove, MancalaState>;
    let minimaxes: Minimax<KalahMove, MancalaState>[];

    beforeEach(() => {
        rules = KalahRules.get();
        minimaxes = [
            new KalahDummyMinimax(),
        ];
    });
    it('should allow simple move', () => {
        // Given any board
        const state: MancalaState = MancalaState.getInitialState();

        // When doing a simple move
        const move: KalahMove = new KalahMove(MancalaMove.FIVE);

        // Then the seed should be distributed
        const expectedBoard: Table<number> = [
            [4, 4, 4, 4, 4, 4],
            [4, 5, 5, 5, 5, 0],
        ];
        const expectedState: MancalaState = new MancalaState(expectedBoard, 1, [0, 0]);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should allow to distribute twice when first landing end up in the kalah', () => {
        // Given a move with the first sub-move landing in the kalah
        const state: MancalaState = MancalaState.getInitialState();

        // When doing the double distribution
        const move: KalahMove = new KalahMove(MancalaMove.THREE, [MancalaMove.FIVE]);

        // Then two distributiong must have been done and one piece dropped in the kalah
        const expectedBoard: Table<number> = [
            [4, 4, 4, 4, 4, 4],
            [5, 6, 6, 1, 5, 0],
        ];
        const expectedState: MancalaState = new MancalaState(expectedBoard, 1, [1, 0]);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should forbid to distribute twice when first landing did not end in the kalah', () => {
        // Given a double distribution with the first one not landing in the kalah
        const state: MancalaState = MancalaState.getInitialState();

        // When doing the double distribution
        const move: KalahMove = new KalahMove(MancalaMove.ONE, [MancalaMove.TWO]);

        // Then the move should be wildly considered as illegal you scumbag hacker !
        // TODO: make this an error throwed, as it's DEV that should prevent it
        RulesUtils.expectMoveFailure(rules, state, move, KalahFailure.CANNOT_PLAY_AFTER_NON_KALAH_MOVE());
    });
    it(`should capture parallel opponent's house when landing in your own territory on an empty house`, () => {
        // Given a board with an opponent's house full of seeds and your paralel house being empty
        const board: Table<number> = [
            [4, 4, 4, 4, 4, 4],
            [0, 0, 0, 0, 2, 0],
        ];
        const state: MancalaState = new MancalaState(board, 4, [0, 0]);

        // When doing a move that end up in this house of your
        const move: KalahMove = new KalahMove(MancalaMove.FOUR);

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
        const move: KalahMove = new KalahMove(MancalaMove.FOUR);

        // Then you should not capture anything
        const expectedBoard: Table<number> = [
            [4, 4, 4, 4, 4, 4],
            [0, 0, 2, 1, 0, 0],
        ];
        const expectedState: MancalaState = new MancalaState(expectedBoard, 5, [0, 0]);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should drop a piece in your kalah when passing by', () => {
        // Given any move going further than your last house
        const state: MancalaState = MancalaState.getInitialState();

        // When doing it
        const move: KalahMove = new KalahMove(MancalaMove.ZERO);

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
        const move: KalahMove = new KalahMove(MancalaMove.ZERO);

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
        const move: KalahMove = new KalahMove(MancalaMove.THREE);

        // Then it should be refused
        RulesUtils.expectMoveFailure(rules, state, move, KalahFailure.MUST_CONTINUE_PLAYING_AFTER_KALAH_MOVE());
    });
    it('should allow to starve opponent', () => {
        // Given a board where the opponent cannot play
        const board: Table<number> = [
            [0, 0, 0, 0, 0, 0],
            [1, 0, 0, 1, 0, 1],
        ];
        const state: MancalaState = new MancalaState(board, 0, [22, 23]);

        // When doing a move not feeding the opponent
        const move: KalahMove = new KalahMove(MancalaMove.THREE);

        // Then your move should capture all pieces
        const expectedBoard: Table<number> = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        const expectedState: MancalaState = new MancalaState(expectedBoard, 1, [25, 23]);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        // TODO: put in another test
        const node: KalahNode = new KalahNode(expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('should capture when landing on empty space inside your territory', () => {
        // Given a board with possible capture
        const board: Table<number> = [
            [0, 0, 0, 1, 0, 7],
            [8, 0, 0, 1, 0, 0],
        ];
        const state: MancalaState = new MancalaState(board, 0, [0, 0]);

        // When doing the move
        const move: KalahMove = new KalahMove(MancalaMove.ZERO);

        // Then the capture should be done too
        const expectedBoard: Table<number> = [
            [1, 1, 1, 2, 1, 0],
            [0, 0, 0, 1, 0, 0],
        ];
        const expectedState: MancalaState = new MancalaState(expectedBoard, 1, [10, 0]);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should allow to pass by kalah several time', () => {
        // Given a board where you could ass by kalah two time
        const state: MancalaState = new MancalaState([
            [6, 1, 7, 6, 1, 7],
            [0, 1, 6, 2, 0, 5],
        ], 3, [4, 2]);

        // When doing that complex move
        const move: KalahMove = new KalahMove(MancalaMove.ZERO, [MancalaMove.FOUR, MancalaMove.ONE]);

        // Then it should be legal
        const expectedState: MancalaState = new MancalaState([
            [0, 0, 9, 8, 0, 9],
            [0, 1, 6, 2, 0, 5],
        ], 4, [4, 4]);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    // TODO: check if we must or not, refill the starting house
});
