/* eslint-disable max-lines-per-function */
import { P4Node, P4Rules } from '../P4Rules';
import { Player } from 'src/app/jscaip/Player';
import { P4State } from '../P4State';
import { P4Move } from '../P4Move';
import { P4Minimax } from '../P4Minimax';
import { P4Failure } from '../P4Failure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Minimax } from 'src/app/jscaip/Minimax';

describe('P4Rules', () => {

    let rules: P4Rules;
    let minimaxes: Minimax<P4Move, P4State>[];
    const O: Player = Player.ZERO;
    const X: Player = Player.ONE;
    const _: Player = Player.NONE;

    beforeEach(() => {
        rules = new P4Rules(P4State);
        minimaxes = [
            new P4Minimax(rules, 'P4Minimax'),
        ];
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
    });
    it('Should drop piece on the lowest case of the column', () => {
        // Given the initial board
        const state: P4State = P4State.getInitialState();

        // When playing in column 3
        const move: P4Move = P4Move.of(3);

        // Then the move should be a success
        const expectedBoard: Player[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const expectedState: P4State = new P4State(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('First player should win vertically', () => {
        // Given a board with 3 aligned pieces
        const board: Player[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, X, O, X, _, X],
        ];
        const state: P4State = new P4State(board, 6);

        // when aligning a fourth piece
        const move: P4Move = P4Move.of(3);

        // Then the move should be legal and player zero winner
        const expectedBoard: Player[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, X, O, X, _, X],
        ];
        const expectedState: P4State = new P4State(expectedBoard, 7);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        const node: P4Node = new P4Node(expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('Second player should win vertically', () => {
        // Given a board with 3 aligned pieces
        const board: Player[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, X, _, _, _],
            [_, O, O, X, O, O, _],
        ];
        const state: P4State = new P4State(board, 7);

        // when aligning a fourth piece
        const move: P4Move = P4Move.of(3);

        // Then the move should be legal and player zero winner
        const expectedBoard: Player[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, X, _, _, _],
            [_, O, O, X, O, O, _],
        ];
        const expectedState: P4State = new P4State(expectedBoard, 8);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        const node: P4Node = new P4Node(expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
    it('Should be a draw', () => {
        // Given a penultian board without victory
        const board: Player[][] = [
            [O, O, O, _, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
        ];
        const state: P4State = new P4State(board, 41);

        // When doing the last move
        const move: P4Move = P4Move.of(3);

        // Then the game should be a hard draw
        const expectedBoard: Player[][] = [
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
        ];
        const expectedState: P4State = new P4State(expectedBoard, 42);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        const node: P4Node = new P4Node(expectedState);
        RulesUtils.expectToBeDraw(rules, node, minimaxes);
    });
    it('should forbid placing a piece on a full column', () => {
        // Given a board with a full column
        const board: Player[][] = [
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, O, X, O, X, O, X],
        ];
        const state: P4State = new P4State(board, 12);

        // When playing on the full column
        const move: P4Move = P4Move.of(0);

        // Then the move should be deemed illegal
        RulesUtils.expectMoveFailure(rules, state, move, P4Failure.COLUMN_IS_FULL());
    });
    it('should know where the lowest space is', () => {
        const board: Player[][] = [
            [_, _, _, X, _, _, _],
            [_, _, O, O, _, _, _],
            [_, _, X, X, _, _, _],
            [_, _, O, O, _, _, _],
            [_, _, X, X, _, _, _],
            [_, _, O, O, _, _, _],
        ];
        expect(P4Rules.getLowestUnoccupiedCase(board, 0)).toBe(5);
        expect(P4Rules.getLowestUnoccupiedCase(board, 2)).toBe(0);
        expect(P4Rules.getLowestUnoccupiedCase(board, 3)).toBe(-1);
    });
});
