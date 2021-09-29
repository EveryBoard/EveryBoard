import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { GipfBoard } from '../GipfBoard';
import { GipfState } from '../GipfState';
import { GipfPiece } from '../GipfPiece';

describe('GipfState', () => {
    const _: GipfPiece = GipfPiece.EMPTY;
    const A: GipfPiece = GipfPiece.PLAYER_ZERO;
    const B: GipfPiece = GipfPiece.PLAYER_ONE;

    describe('initial state', () => {
        const state: GipfState = GipfState.getInitialState();

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
            state.board.forEachCoord((_: Coord, content: GipfPiece) => {
                if (content !== GipfPiece.EMPTY) {
                    if (content.player === Player.ZERO) {
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
            const board: GipfBoard = GipfBoard.of([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ]);
            const state: GipfState = new GipfState(board, 5, [5, 5], [0, 0]);
            expect(state.equals(state)).toBeTrue();
        });
        it('should distinguish states that are different due to a different board', () => {
            const board1: GipfBoard = GipfBoard.of([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ]);
            const state1: GipfState = new GipfState(board1, 6, [5, 5], [0, 0]);

            const board2: GipfBoard = GipfBoard.of([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, A],
                [_, _, _, _, _, B, _],
                [A, B, A, _, A, _, _],
                [A, _, _, B, B, B, _],
                [B, _, B, _, _, _, _],
                [_, A, _, _, _, _, _],
            ]);
            const state2: GipfState = new GipfState(board2, 6, [5, 5], [0, 0]);
            expect(state1.equals(state2)).toBeFalse();
        });
        it('should distinguish states that are different due to a different turn', () => {
            const board: GipfBoard = GipfBoard.of([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ]);
            const state1: GipfState = new GipfState(board, 5, [5, 5], [0, 0]);
            const state2: GipfState = new GipfState(board, 6, [5, 5], [0, 0]);
            expect(state1.equals(state2)).toBeFalse();
        });
        it('should distinguish states that are different due to different side pieces', () => {
            const board: GipfBoard = GipfBoard.of([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ]);
            const state1: GipfState = new GipfState(board, 5, [5, 5], [0, 0]);
            const state2: GipfState = new GipfState(board, 5, [5, 6], [0, 0]);
            expect(state1.equals(state2)).toBeFalse();
            const state3: GipfState = new GipfState(board, 5, [6, 5], [0, 0]);
            expect(state1.equals(state3)).toBeFalse();
        });
        it('should distinguish states that are different due to different captured pieces', () => {
            const board: GipfBoard = GipfBoard.of([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ]);
            const state1: GipfState = new GipfState(board, 5, [5, 5], [0, 0]);
            const state2: GipfState = new GipfState(board, 5, [5, 5], [0, 1]);
            expect(state1.equals(state2)).toBeFalse();
            const state3: GipfState = new GipfState(board, 5, [5, 5], [1, 0]);
            expect(state1.equals(state3)).toBeFalse();
        });
    });
});
