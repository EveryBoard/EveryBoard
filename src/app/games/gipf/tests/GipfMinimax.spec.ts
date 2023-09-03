/* eslint-disable max-lines-per-function */
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GipfState } from '../GipfState';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { GipfNode, GipfRules } from '../GipfRules';
import { GipfMinimax } from '../GipfMinimax';
import { Table } from 'src/app/utils/ArrayUtils';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Player } from 'src/app/jscaip/Player';

describe('GipfMinimax', () => {

    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const _: FourStatePiece = FourStatePiece.EMPTY;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    const P0Turn: number = 6;

    let rules: GipfRules;

    let minimax: GipfMinimax;

    beforeEach(() => {
        rules = GipfRules.get();
        minimax = new GipfMinimax(rules, 'GipfMinimax');
    });
    describe('getListMoves', () => {

        it('should have 30 moves on the initial state', () => {
            const node: GipfNode = rules.getInitialNode();
            expect(minimax.getListMoves(node).length).toBe(30);
        });
        it('should have 0 moves on a victory state', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, _, O, _, _],
                [N, N, _, _, O, _, _],
                [N, _, _, _, _, O, _],
                [O, X, O, _, X, _, _],
                [O, _, _, O, X, X, N],
                [X, _, X, _, _, N, N],
                [_, X, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [0, 5], [0, 0]);
            const node: GipfNode = new GipfNode(state);
            expect(minimax.getListMoves(node).length).toBe(0);
        });
        it('should have 19 moves on an example state with non-intersecting capture', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, _, _, _, _],
                [N, N, O, O, O, O, _],
                [N, _, _, _, _, O, _],
                [_, O, O, O, O, _, _],
                [_, _, _, O, X, X, N],
                [_, _, X, O, _, N, N],
                [_, _, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(state);
            expect(minimax.getListMoves(node).length).toBe(19);
        });
        it('should have 20 moves on an example state with a complete line', () => {
            // 16 simple moves and 4 diagonal ones on the occupied borders
            const board: Table<FourStatePiece> = [
                [N, N, N, O, _, _, _],
                [N, N, _, X, _, _, _],
                [N, _, _, O, _, _, _],
                [_, _, _, X, _, _, _],
                [_, _, _, O, _, _, N],
                [_, _, _, X, _, N, N],
                [_, _, _, O, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(state);
            expect(minimax.getListMoves(node).length).toBe(20);
        });
        it('should have 30 moves on an example state with all borders occupied', () => {
            // 16 simple moves and 4 diagonal ones on the occupied borders
            const board: Table<FourStatePiece> = [
                [N, N, N, O, X, O, X],
                [N, N, X, _, _, _, O],
                [N, O, _, _, _, _, X],
                [X, _, _, _, _, _, O],
                [O, _, _, _, _, X, N],
                [X, _, _, _, O, N, N],
                [O, X, O, X, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(state);
            expect(minimax.getListMoves(node).length).toBe(30);
        });
        it('should have 38 moves on an example state with intersecting captures', () => {
            // There are 19 valid placements, each can be played with one of 2 captures
            const board: Table<FourStatePiece> = [
                [N, N, N, _, _, _, _],
                [N, N, _, _, O, _, _],
                [N, _, _, O, _, O, _],
                [_, O, O, O, O, _, _],
                [_, _, _, O, X, X, N],
                [_, _, X, O, _, N, N],
                [_, _, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(state);
            expect(minimax.getListMoves(node).length).toBe(38);
        });
    });
    describe('getBoardValue', () => {
        it('should favor having captured pieces', () => {
            // Given a state with more captured pieces than another
            const board: Table<FourStatePiece> = [
                [N, N, N, _, O, _, _],
                [N, N, _, _, O, _, _],
                [N, _, _, _, _, O, _],
                [O, X, O, _, X, _, _],
                [O, _, _, O, X, X, N],
                [X, _, X, _, _, N, N],
                [_, X, _, _, N, N, N],
            ];
            const capturedPieces: [number, number] = [0, 3];
            const moreCapturedPieces: [number, number] = [0, 7];
            const weakState: GipfState = new GipfState(board, P0Turn, [5, 5], capturedPieces);
            const strongState: GipfState = new GipfState(board, P0Turn, [5, 5], moreCapturedPieces);
            // When computing their minimax values
            // Then it should prefer having more captured pieces
            RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE);
        });
        it('should favor having pieces to play pieces', () => {
            // Given two states differing only in available pieces to place
            const board: Table<FourStatePiece> = [
                [N, N, N, _, O, _, _],
                [N, N, _, _, O, _, _],
                [N, _, _, _, _, O, _],
                [O, X, O, _, X, _, _],
                [O, _, _, O, X, X, N],
                [X, _, X, _, _, N, N],
                [_, X, _, _, N, N, N],
            ];
            const piecesToPlay: [number, number] = [5, 5];
            const morePiecesToPlay: [number, number] = [5, 7];
            const weakState: GipfState = new GipfState(board, P0Turn, piecesToPlay, [0, 0]);
            const strongState: GipfState = new GipfState(board, P0Turn, morePiecesToPlay, [0, 0]);
            // When computing their minimax values
            // Then it should prefer having more pieces to place
            RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ONE);
        });
    });
});