/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { GipfState } from '../GipfState';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Table } from 'src/app/utils/ArrayUtils';
import { GipfRules } from '../GipfRules';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

describe('GipfState', () => {

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const A: FourStatePiece = FourStatePiece.ZERO;
    const B: FourStatePiece = FourStatePiece.ONE;

    describe('initial state', () => {
        const state: GipfState = GipfRules.get().getInitialState();

        it('should have 12 pieces to place for each player', () => {
            expect(state.getNumberOfPiecesToPlace(Player.ZERO)).toBe(12);
            expect(state.getNumberOfPiecesToPlace(Player.ONE)).toBe(12);
        });

        it('should have 0 captured pieces for each player', () => {
            expect(state.getNumberOfPiecesCaptured(Player.ZERO)).toBe(0);
            expect(state.getNumberOfPiecesCaptured(Player.ONE)).toBe(0);
        });

        it('should contain 3 simple pieces for each player', () => {
            let p0: number = 0;
            let p1: number = 0;
            state.forEachCoord((_: Coord, content: FourStatePiece) => {
                if (content !== FourStatePiece.EMPTY) {
                    if (content === FourStatePiece.ZERO) {
                        p0 += 1;
                    } else {
                        p1 += 1;
                    }
                }
            });
            expect(p0).toBe(3);
            expect(p1).toBe(3);
        });

        it('should start at turn 0', () => {
            expect(state.turn).toBe(0);
        });

    });

    describe('equals', () => {

        it('should detect that a state is equal to itself', () => {
            const board: Table<FourStatePiece> = [
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ];
            const state: GipfState = new GipfState(board, 5, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));
            expect(state.equals(state)).toBeTrue();
        });

        it('should distinguish states that are different due to a different board', () => {
            const board1: Table<FourStatePiece> = [
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ];
            const state1: GipfState = new GipfState(board1, 6, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));

            const board2: Table<FourStatePiece> = [
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, A],
                [_, _, _, _, _, B, _],
                [A, B, A, _, A, _, _],
                [A, _, _, B, B, B, _],
                [B, _, B, _, _, _, _],
                [_, A, _, _, _, _, _],
            ];
            const state2: GipfState = new GipfState(board2, 6, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));
            expect(state1.equals(state2)).toBeFalse();
        });

        it('should distinguish states that are different due to a different turn', () => {
            const board: Table<FourStatePiece> = [
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ];
            const state1: GipfState = new GipfState(board, 5, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));
            const state2: GipfState = new GipfState(board, 6, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));
            expect(state1.equals(state2)).toBeFalse();
        });

        it('should distinguish states that are different due to different side pieces', () => {
            const board: Table<FourStatePiece> = [
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ];
            const state1: GipfState = new GipfState(board, 5, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));
            const state2: GipfState = new GipfState(board, 5, PlayerNumberMap.of(5, 6), PlayerNumberMap.of(0, 0));
            expect(state1.equals(state2)).toBeFalse();
            const state3: GipfState = new GipfState(board, 5, PlayerNumberMap.of(6, 5), PlayerNumberMap.of(0, 0));
            expect(state1.equals(state3)).toBeFalse();
        });

        it('should distinguish states that are different due to different captured pieces', () => {
            const board: Table<FourStatePiece> = [
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ];
            const state1: GipfState = new GipfState(board, 5, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));
            const state2: GipfState = new GipfState(board, 5, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 1));
            expect(state1.equals(state2)).toBeFalse();
            const state3: GipfState = new GipfState(board, 5, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(1, 0));
            expect(state1.equals(state3)).toBeFalse();
        });

    });

});
