/* eslint-disable max-lines-per-function */
import { YinshState } from '../YinshState';
import { YinshCapture } from '../YinshMove';
import { YinshPiece } from '../YinshPiece';
import { YinshNode, YinshRules } from '../YinshRules';
import { Table } from 'src/app/jscaip/TableUtils';
import { YinshMoveGenerator } from '../YinshMoveGenerator';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('YinshMoveGenerator', () => {

    const _: YinshPiece = YinshPiece.EMPTY;
    const N: YinshPiece = YinshPiece.UNREACHABLE;
    const a: YinshPiece = YinshPiece.MARKER_ZERO;
    const A: YinshPiece = YinshPiece.RING_ZERO;
    const B: YinshPiece = YinshPiece.RING_ONE;

    let rules: YinshRules;

    let moveGenerator: YinshMoveGenerator;
    const defaultConfig: NoConfig = YinshRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = YinshRules.get();
        moveGenerator = new YinshMoveGenerator();
    });

    describe('getListMoves', () => {

        it('should have 85 moves on first turn', () => {
            const node: YinshNode = rules.getInitialNode(defaultConfig);
            expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(85);
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 1);

            const node: YinshNode = new YinshNode(state);
            expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(84);
        });

        it('should have no moves at the end of the game', () => {
            const state: YinshState =
                new YinshState(YinshRules.get().getInitialState().board, PlayerNumberMap.of(3, 2), 20);
            const node: YinshNode = new YinshNode(state);
            expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(0);
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);

            const node: YinshNode = new YinshNode(state);
            expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(18);
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);

            const node: YinshNode = new YinshNode(state);
            expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(11);
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);

            const node: YinshNode = new YinshNode(state);
            expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(10);

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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);

            const node: YinshNode = new YinshNode(state);
            expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(11);
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);

            const node: YinshNode = new YinshNode(state);
            for (const move of moveGenerator.getListMoves(node, defaultConfig)) {
                move.initialCaptures.forEach((capture: YinshCapture) =>
                    expect(capture.ringTaken.isPresent()).toBeTrue());
                move.finalCaptures.forEach((capture: YinshCapture) =>
                    expect(capture.ringTaken.isPresent()).toBeTrue());
            }
        });

    });

});
