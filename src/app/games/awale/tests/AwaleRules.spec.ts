/* eslint-disable max-lines-per-function */
import { AwaleNode, AwaleRules } from '../AwaleRules';
import { AwaleMove } from '../AwaleMove';
import { AwaleState } from '../AwaleState';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { AwaleMinimax } from '../AwaleMinimax';
import { AwaleFailure } from '../AwaleFailure';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Table } from 'src/app/utils/ArrayUtils';

describe('AwaleRules', () => {

    let rules: AwaleRules;
    let minimaxes: AwaleMinimax[];

    beforeEach(() => {
        rules = new AwaleRules(AwaleState);
        minimaxes = [
            new AwaleMinimax(rules, 'AwaleMinimax'),
        ];
    });
    it('should distribute', () => {
        // Given a state where the player can perform a distributing move
        const board: Table<number> = [
            [0, 0, 0, 0, 3, 4],
            [0, 0, 0, 0, 0, 0],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);
        // When performing a distribution
        const move: AwaleMove = AwaleMove.FIVE;
        // Then the distribution should be performed as expected
        const expectedBoard: Table<number> = [
            [0, 0, 0, 0, 3, 0],
            [0, 0, 1, 1, 1, 1],
        ];
        const expectedState: AwaleState = new AwaleState(expectedBoard, 1, [0, 0]);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should not drop a piece in the starting space', () => {
        // Given a state where the player can perform a distributing move with at least 12 stones
        const board: Table<number> = [
            [0, 0, 0, 0, 0, 18],
            [0, 0, 0, 0, 0, 0],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);
        // When performing a distribution
        const move: AwaleMove = AwaleMove.FIVE;
        // Then the distribution should be performed as expected, and leave 0 stones in the starting space
        const expectedBoard: Table<number> = [
            [2, 1, 1, 1, 1, 0],
            [2, 2, 2, 2, 2, 2],
        ];
        const expectedState: AwaleState = new AwaleState(expectedBoard, 1, [0, 0]);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should capture for player zero', () => {
        // Given a state where a capture is possible for player 0
        const board: Table<number> = [
            [0, 0, 0, 0, 1, 1],
            [0, 0, 0, 0, 1, 1],
        ];
        const state: AwaleState = new AwaleState(board, 0, [1, 2]);
        // When performing a move that will capture
        const move: AwaleMove = AwaleMove.FIVE;
        // Then the capture should be performed
        const expectedBoard: Table<number> = [
            [0, 0, 0, 0, 1, 0],
            [0, 0, 0, 0, 1, 0],
        ];
        const expectedState: AwaleState = new AwaleState(expectedBoard, 1, [3, 2]);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should capture for player one', () => {
        // Given a state where a capture is possible for player 1
        const board: Table<number> = [
            [1, 1, 0, 0, 0, 0],
            [1, 1, 0, 0, 0, 0],
        ];
        const state: AwaleState = new AwaleState(board, 1, [1, 2]);
        // When performing a move that will capture
        const move: AwaleMove = AwaleMove.ZERO;
        // Then the capture should be performed
        const expectedBoard: Table<number> = [
            [0, 1, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
        ];
        const expectedState: AwaleState = new AwaleState(expectedBoard, 2, [1, 4]);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should do mansoon when impossible distribution', () => {
        // Given a state where the player is about to give his last stone to opponent
        const board: Table<number> = [
            [0, 0, 0, 0, 0, 1],
            [0, 1, 2, 3, 4, 4],
        ];
        const state: AwaleState = new AwaleState(board, 0, [23, 10]);

        // When player give its last stone
        const move: AwaleMove = AwaleMove.FIVE;

        // Then, since the other player can't distribute, all its pieces should be mansooned
        const expectedBoard: Table<number> = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        const expectedState: AwaleState = new AwaleState(expectedBoard, 1, [23, 25]);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        const node: AwaleNode = new AwaleNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
    it('should not do mansoon when a distribution is possible', () => {
        // Given a state where the player is about to give his last stone to opponent
        const board: Table<number> = [
            [0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);

        // When player give its last stone
        const move: AwaleMove = AwaleMove.FIVE;

        // Then the move should be legal and no mansoon should be done
        const expectedBoard: Table<number> = [
            [0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 1],
        ];
        const expectedState: AwaleState = new AwaleState(expectedBoard, 1, [0, 0]);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should forbid non-feeding move', () => {
        // Given a state where the player could and should feed its opponent
        const board: Table<number> = [
            [1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0],
        ];
        const state: AwaleState = new AwaleState(board, 0, [23, 23]);

        // when performing a move that does not feed the opponent
        const move: AwaleMove = AwaleMove.ZERO;

        // Then the move should be illegal
        RulesUtils.expectMoveFailure(rules, state, move, AwaleFailure.SHOULD_DISTRIBUTE());
    });
    it('should allow feeding move', () => {
        // Given a state where the player could and should feed its opponent
        const board: Table<number> = [
            [1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0],
        ];
        const state: AwaleState = new AwaleState(board, 0, [23, 23]);

        // when performing a move that feeds the opponent
        const move: AwaleMove = AwaleMove.FIVE;
        const expectedBoard: Table<number> = [
            [1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1],
        ];
        const expectedState: AwaleState = new AwaleState(expectedBoard, 1, [23, 23]);

        // Then the move should be legal
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('shoud distribute but not capture in case of would-starve move', () => {
        // Given a state in which the player could capture all opponents seeds
        const board: Table<number> = [
            [1, 0, 0, 0, 0, 2],
            [0, 0, 0, 0, 1, 1],
        ];
        const state: AwaleState = new AwaleState(board, 0, [0, 0]);

        // When the player does a would-starve move
        const move: AwaleMove = AwaleMove.FIVE;

        // Then, the distribution should be done but not the capture
        const expectedBoard: Table<number> = [
            [1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 2, 2],
        ];
        const expectedState: AwaleState = new AwaleState(expectedBoard, 1, [0, 0]);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    describe('getGameStatus', () => {
        it('should identify victory for player 0', () => {
            // Given a state with no more seeds and where player 0 has captured more seeds
            const board: Table<number> = [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
            ];
            const state: AwaleState = new AwaleState(board, 5, [26, 22]);
            const node: AwaleNode = new AwaleNode(state);
            // Then it should be a victory for player 0
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
        });
        it('should identify victory for player 1', () => {
            // Given a state with no more seeds and where player 1 has captured more seeds
            const board: Table<number> = [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
            ];
            const state: AwaleState = new AwaleState(board, 5, [22, 26]);
            const node: AwaleNode = new AwaleNode(state);
            // Then it should be a victory for player 1
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
        });
        it('should identify draw', () => {
            // Given a state with no more seeds and both players have captured the same number of seeds
            const board: Table<number> = [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
            ];
            const state: AwaleState = new AwaleState(board, 5, [24, 24]);
            const node: AwaleNode = new AwaleNode(state);
            // Thin it should be a draw
            RulesUtils.expectToBeDraw(rules, node, minimaxes);
        });
    });
});
