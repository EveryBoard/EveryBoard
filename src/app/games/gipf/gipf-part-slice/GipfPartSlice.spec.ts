import { Coord } from 'src/app/jscaip/coord/Coord';
import { HexaBoard } from 'src/app/jscaip/hexa/HexaBoard';
import { Player } from 'src/app/jscaip/player/Player';
import { GipfPiece } from '../gipf-piece/GipfPiece';
import { GipfPartSlice } from './GipfPartSlice';

describe('GipfPartSlice', () => {
    const _: GipfPiece = GipfPiece.EMPTY;
    const A: GipfPiece = GipfPiece.PLAYER_ZERO;
    const B: GipfPiece = GipfPiece.PLAYER_ONE;

    describe('initial slice', () => {
        const slice: GipfPartSlice = GipfPartSlice.getInitialSlice();

        it('should have 12 pieces to place for each player', () => {
            expect(slice.getNumberOfPiecesToPlace(Player.ZERO)).toBe(12);
            expect(slice.getNumberOfPiecesToPlace(Player.ONE)).toBe(12);
        });
        it('should have 0 captured pieces for each player', () => {
            expect(slice.getNumberOfPiecesCaptured(Player.ZERO)).toBe(0);
            expect(slice.getNumberOfPiecesCaptured(Player.ONE)).toBe(0);
        });
        it('should contain 3 simple pieces for each player', () => {
            let p0: number = 0;
            let p1: number = 0;
            slice.hexaBoard.forEachCoord((_: Coord, content: GipfPiece) => {
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
            expect(slice.turn).toBe(0);
        });
    });

    describe('equals', () => {
        it('should detect that a slice is equal to itself', () => {
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ], [1], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, 5, [5, 5], [0, 0]);
            expect(slice.equals(slice)).toBeTrue();
        });
        it('should distinguish slices that are different due to a different board', () => {
            const board1: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ], [1], _, GipfPiece.encoder);
            const slice1: GipfPartSlice = new GipfPartSlice(board1, 6, [5, 5], [0, 0]);

            const board2: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, A],
                [_, _, _, _, _, B, _],
                [A, B, A, _, A, _, _],
                [A, _, _, B, B, B, _],
                [B, _, B, _, _, _, _],
                [_, A, _, _, _, _, _],
            ], [1], _, GipfPiece.encoder);
            const slice2: GipfPartSlice = new GipfPartSlice(board2, 6, [5, 5], [0, 0]);
            expect(slice1.equals(slice2)).toBeFalse();
        });
        it('should distinguish slices that are different due to a different turn', () => {
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ], [1], _, GipfPiece.encoder);
            const slice1: GipfPartSlice = new GipfPartSlice(board, 5, [5, 5], [0, 0]);
            const slice2: GipfPartSlice = new GipfPartSlice(board, 6, [5, 5], [0, 0]);
            expect(slice1.equals(slice2)).toBeFalse();
        });
        it('should distinguish slices that are different due to different side pieces', () => {
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ], [1], _, GipfPiece.encoder);
            const slice1: GipfPartSlice = new GipfPartSlice(board, 5, [5, 5], [0, 0]);
            const slice2: GipfPartSlice = new GipfPartSlice(board, 5, [5, 6], [0, 0]);
            expect(slice1.equals(slice2)).toBeFalse();
            const slice3: GipfPartSlice = new GipfPartSlice(board, 5, [6, 5], [0, 0]);
            expect(slice1.equals(slice3)).toBeFalse();
        });
        it('should distinguish slices that are different due to different captured pieces', () => {
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ], [1], _, GipfPiece.encoder);
            const slice1: GipfPartSlice = new GipfPartSlice(board, 5, [5, 5], [0, 0]);
            const slice2: GipfPartSlice = new GipfPartSlice(board, 5, [5, 5], [0, 1]);
            expect(slice1.equals(slice2)).toBeFalse();
            const slice3: GipfPartSlice = new GipfPartSlice(board, 5, [5, 5], [1, 0]);
            expect(slice1.equals(slice3)).toBeFalse();
        });
    });
});
