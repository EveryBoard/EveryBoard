/* eslint-disable max-lines-per-function */
import { YinshState } from '../YinshState';
import { YinshPiece } from '../YinshPiece';
import { Table } from 'src/app/jscaip/TableUtils';
import { YinshRules } from '../YinshRules';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

describe('YinshState', () => {

    describe('equals', () => {
        const _: YinshPiece = YinshPiece.EMPTY;
        const N: YinshPiece = YinshPiece.UNREACHABLE;
        const A: YinshPiece = YinshPiece.RING_ZERO;

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
        it('should detect that a state is equal to itself', () => {
            const state: YinshState = YinshRules.get().getInitialState();
            expect(state.equals(state)).toBeTrue();
        });

        it('should detect when two states differ due to their turn', () => {
            const state1: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 0);
            const state2: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 1);
            expect(state1.equals(state2)).toBeFalse();
        });

        it('should detect when two states differ due to their side rings', () => {
            const state1: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 0);
            const state2: YinshState = new YinshState(board, PlayerNumberMap.of(0, 1), 0);
            const state3: YinshState = new YinshState(board, PlayerNumberMap.of(1, 0), 0);
            expect(state1.equals(state2)).toBeFalse();
            expect(state1.equals(state3)).toBeFalse();
        });

        it('should detect when two states differ due to their board', () => {
            const board2: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state1: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 0);
            const state2: YinshState = new YinshState(board2, PlayerNumberMap.of(0, 0), 0);
            expect(state1.equals(state2)).toBeFalse();
        });

    });

});
