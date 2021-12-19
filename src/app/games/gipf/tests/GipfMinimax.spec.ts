import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GipfMove, GipfPlacement } from '../GipfMove';
import { GipfState } from '../GipfState';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { GipfNode, GipfRules } from '../GipfRules';
import { GipfMinimax } from '../GipfMinimax';
import { Table } from 'src/app/utils/ArrayUtils';

describe('GipfMinimax', () => {

    const N: FourStatePiece = FourStatePiece.NONE;
    const _: FourStatePiece = FourStatePiece.EMPTY;
    const A: FourStatePiece = FourStatePiece.ZERO;
    const B: FourStatePiece = FourStatePiece.ONE;
    const P0Turn: number = 6;

    let rules: GipfRules;

    let minimax: GipfMinimax;

    beforeEach(() => {
        rules = new GipfRules(GipfState);
        minimax = new GipfMinimax(rules, 'GipfMinimax');
    });
    describe('getListMoves', () => {

        it('should have 30 moves on the initial state', () => {
            expect(minimax.getListMoves(rules.node).length).toBe(30);
        });
        it('should have 0 moves on a victory state', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, _, A, _, _],
                [N, N, _, _, A, _, _],
                [N, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, N],
                [B, _, B, _, _, N, N],
                [_, B, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [0, 5], [0, 0]);
            const node: GipfNode = new GipfNode(state);
            expect(minimax.getListMoves(node).length).toBe(0);
        });
        it('should have 19 moves on an example state with non-intersecting capture', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, _, _, _, _],
                [N, N, A, A, A, A, _],
                [N, _, _, _, _, A, _],
                [_, A, A, A, A, _, _],
                [_, _, _, A, B, B, N],
                [_, _, B, A, _, N, N],
                [_, _, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(state);
            expect(minimax.getListMoves(node).length).toBe(19);
        });
        it('should have 20 moves on an example state with a complete line', () => {
            // 16 simple moves and 4 diagonal ones on the occupied borders
            const board: Table<FourStatePiece> = [
                [N, N, N, A, _, _, _],
                [N, N, _, B, _, _, _],
                [N, _, _, A, _, _, _],
                [_, _, _, B, _, _, _],
                [_, _, _, A, _, _, N],
                [_, _, _, B, _, N, N],
                [_, _, _, A, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(state);
            expect(minimax.getListMoves(node).length).toBe(20);
        });
        it('should have 30 moves on an example state with all borders occupied', () => {
            // 16 simple moves and 4 diagonal ones on the occupied borders
            const board: Table<FourStatePiece> = [
                [N, N, N, A, B, A, B],
                [N, N, B, _, _, _, A],
                [N, A, _, _, _, _, B],
                [B, _, _, _, _, _, A],
                [A, _, _, _, _, B, N],
                [B, _, _, _, A, N, N],
                [A, B, A, B, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(state);
            expect(minimax.getListMoves(node).length).toBe(30);
        });
        it('should have 38 moves on an example state with intersecting captures', () => {
            // There are 19 valid placements, each can be played with one of 2 captures
            const board: Table<FourStatePiece> = [
                [N, N, N, _, _, _, _],
                [N, N, _, _, A, _, _],
                [N, _, _, A, _, A, _],
                [_, A, A, A, A, _, _],
                [_, _, _, A, B, B, N],
                [_, _, B, A, _, N, N],
                [_, _, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(state);
            expect(minimax.getListMoves(node).length).toBe(38);
        });
    });
    describe('getBoardValue', () => {
        const placement: GipfPlacement = new GipfPlacement(new Coord(1, 6),
                                                           MGPOptional.of(HexaDirection.UP_RIGHT));
        const dummyMove: GipfMove = new GipfMove(placement, [], []);

        it('should favor having captured pieces', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, _, A, _, _],
                [N, N, _, _, A, _, _],
                [N, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, N],
                [B, _, B, _, _, N, N],
                [_, B, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 7]);
            const node: GipfNode = new GipfNode(state, MGPOptional.empty(), MGPOptional.of(dummyMove));
            expect(minimax.getBoardValue(node)).toBeLessThan(0);
        });
        it('should favor having pieces to play pieces', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, _, A, _, _],
                [N, N, _, _, A, _, _],
                [N, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, N],
                [B, _, B, _, _, N, N],
                [_, B, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 7], [0, 0]);
            const node: GipfNode = new GipfNode(state, MGPOptional.empty(), MGPOptional.of(dummyMove));
            expect(minimax.getBoardValue(node)).toBeLessThan(0);
        });
    });
});
