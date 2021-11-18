import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { YinshState } from '../YinshState';
import { YinshMinimax } from '../YinshMinimax';
import { YinshCapture } from '../YinshMove';
import { YinshPiece } from '../YinshPiece';
import { YinshNode, YinshRules } from '../YinshRules';
import { Table } from 'src/app/utils/ArrayUtils';

describe('YinshMinimax', () => {

    const _: YinshPiece = YinshPiece.EMPTY;
    const N: YinshPiece = YinshPiece.NONE;
    const a: YinshPiece = YinshPiece.MARKER_ZERO;
    const A: YinshPiece = YinshPiece.RING_ZERO;
    const B: YinshPiece = YinshPiece.RING_ONE;

    let rules: YinshRules;

    let minimax: YinshMinimax;

    beforeEach(() => {
        rules = new YinshRules(YinshState);
        minimax = new YinshMinimax(rules, 'YinshMinimax');
    });
    describe('getListMoves', () => {
        it('should have 85 moves on first turn', () => {
            expect(minimax.getListMoves(rules.node).length).toBe(85);
        });
        it('should have 84 moves on second placement in initial phase', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 1);

            rules.node = new YinshNode(state);
            expect(minimax.getListMoves(rules.node).length).toBe(84);
        });
        it('should have no moves at the end of the game', () => {
            const state: YinshState = new YinshState(YinshState.getInitialState().board, [3, 2], 20);
            rules.node = new YinshNode(state);
            expect(minimax.getListMoves(rules.node).length).toBe(0);
        });
        it('should have 18 moves on a specific state after the placement phase', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);

            rules.node = new YinshNode(state);
            expect(minimax.getListMoves(rules.node).length).toBe(18);
        });
        it('should have 11 moves on a board with a possible capture', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);

            rules.node = new YinshNode(state);
            expect(minimax.getListMoves(rules.node).length).toBe(11);
        });
        it('should list moves that try to flip a ring', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, B, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);

            rules.node = new YinshNode(state);
            expect(minimax.getListMoves(rules.node).length).toBe(10);

        });
        it('should not list moves that jump over two non-joined groups of pieces', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);

            rules.node = new YinshNode(state);
            expect(minimax.getListMoves(rules.node).length).toBe(11);
        });
        it('should take a ring when it is capturing', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);

            rules.node = new YinshNode(state);
            for (const move of minimax.getListMoves(rules.node)) {
                move.initialCaptures.forEach((capture: YinshCapture) =>
                    expect(capture.ringTaken.equals(new Coord(-1, -1))).toBeFalse());
                move.finalCaptures.forEach((capture: YinshCapture) =>
                    expect(capture.ringTaken.equals(new Coord(-1, -1))).toBeFalse());
            }
        });
    });
    describe('getBoardValue', () => {
        it('should assign higher values for the player with most rings', () => {
            const state: YinshState = new YinshState(YinshState.getInitialState().board, [2, 1], 20);
            rules.node = new YinshNode(state);
            expect(minimax.getBoardValue(rules.node).value * Player.ZERO.getScoreModifier()).toBeGreaterThan(0);
        });
    });
});
