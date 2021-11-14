import { P4Node, P4Rules } from '../P4Rules';
import { Player } from 'src/app/jscaip/Player';
import { P4State } from '../P4State';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { P4Move } from '../P4Move';
import { P4Minimax } from '../P4Minimax';
import { P4Failure } from '../P4Failure';

describe('P4Rules', () => {

    let rules: P4Rules;
    let minimax: P4Minimax;
    const O: Player = Player.ZERO;
    const X: Player = Player.ONE;
    const _: Player = Player.NONE;

    beforeEach(() => {
        rules = new P4Rules(P4State);
        minimax = new P4Minimax(rules, 'P4Minimax');
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(minimax.getBoardValue(rules.node).value).toEqual(0);
    });
    it('Should drop piece on the lowest case of the column', () => {
        const board: Player[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const expectedBoard: Player[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const state: P4State = new P4State(board, 0);
        const move: P4Move = P4Move.of(3);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: P4State = rules.applyLegalMove(move, state, status);
        expect(resultingState.board).toEqual(expectedBoard);
    });
    it('First player should win vertically', () => {
        const board: Player[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const expectedBoard: Player[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const state: P4State = new P4State(board, 0);
        rules.node = new MGPNode(state);
        const move: P4Move = P4Move.of(3);
        expect(rules.choose(move)).toBeTrue();
        expect(rules.node.gameState.board).toEqual(expectedBoard);
        expect(rules.node.getOwnValue(minimax).value).toEqual(Number.MIN_SAFE_INTEGER);
        expect(rules.getGameStatus(rules.node).isEndGame).toBeTrue();
    });
    it('Second player should win vertically', () => {
        const board: Player[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, X, _, _, _],
        ];
        const expectedBoard: Player[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, X, _, _, _],
        ];
        const state: P4State = new P4State(board, 1);
        rules.node = new MGPNode(state);
        const move: P4Move = P4Move.of(3);
        expect(rules.choose(move)).toBeTrue();
        expect(rules.node.gameState.board).toEqual(expectedBoard);
        expect(rules.node.getOwnValue(minimax).value).toEqual(Number.MAX_SAFE_INTEGER);
        expect(rules.getGameStatus(rules.node).isEndGame).toBeTrue();
    });
    it('Should be a draw', () => {
        const board: Player[][] = [
            [O, O, O, _, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
        ];
        const expectedBoard: Player[][] = [
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
        ];
        const state: P4State = new P4State(board, 41);
        rules.node = new MGPNode(state);
        const move: P4Move = P4Move.of(3);
        expect(rules.choose(move)).toBeTrue();
        const resultingState: P4State = rules.node.gameState;
        expect(resultingState.board).toEqual(expectedBoard);
        expect(rules.getGameStatus(rules.node).isEndGame).toBeTrue();
        expect(rules.node.getOwnValue(minimax).value).toBe(0);
    });
    it('Should know when a column is full or not', () => {
        const board: Player[][] = [
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, O, X, O, X, O, X],
        ];
        const state: P4State = new P4State(board, 12);
        const node: P4Node = new MGPNode(state);
        expect(minimax.getListMoves(node).length).toBe(6);
    });
    it('should forbid placing a piece on a full column', () => {
        const board: Player[][] = [
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, O, X, O, X, O, X],
        ];
        const state: P4State = new P4State(board, 12);
        const move: P4Move = P4Move.of(0);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(P4Failure.COLUMN_IS_FULL());
    });
    it('should assign greater score to center column', () => {
        const board1: Player[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const state1: P4State = new P4State(board1, 12);
        const board2: Player[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, O],
        ];
        const state2: P4State = new P4State(board2, 12);

        expect(P4Rules.getBoardValue(state1).value).toBeLessThan(P4Rules.getBoardValue(state2).value);
    });
    it('should know where the lowest case is', () => {
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
