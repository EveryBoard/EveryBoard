/* eslint-disable max-lines-per-function */
import { GipfState } from '../GipfState';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { GipfNode, GipfRules } from '../GipfRules';
import { Table } from 'src/app/utils/ArrayUtils';
import { GipfMoveGenerator } from '../GipfMoveGenerator';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

const N: FourStatePiece = FourStatePiece.UNREACHABLE;
const _: FourStatePiece = FourStatePiece.EMPTY;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;

describe('GipfMoveGenerator', () => {

    let rules: GipfRules;

    let moveGenerator: GipfMoveGenerator;
    const defaultConfig: MGPOptional<EmptyRulesConfig> = GipfRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = GipfRules.get();
        moveGenerator = new GipfMoveGenerator();
    });
    describe('getListMoves', () => {

        it('should have 30 moves on the initial state', () => {
            const node: GipfNode = rules.getInitialNode(MGPOptional.empty());
            expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(30);
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
            const state: GipfState = new GipfState(board, 0, [0, 5], [0, 0]);
            const node: GipfNode = new GipfNode(state);
            expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(0);
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
            const state: GipfState = new GipfState(board, 0, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(state);
            expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(19);
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
            const state: GipfState = new GipfState(board, 0, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(state);
            expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(20);
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
            const state: GipfState = new GipfState(board, 0, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(state);
            expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(30);
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
            const state: GipfState = new GipfState(board, 0, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(state);
            expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(38);
        });

    });

});
