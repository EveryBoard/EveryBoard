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
        it('should distinguish different slices', () => {
            const board1: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice1: GipfPartSlice = new GipfPartSlice(board1, 6, [5, 5], [0, 0]);

            const board2: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, A],
                [_, _, _, _, _, B, _],
                [A, B, A, _, A, _, _],
                [A, _, _, B, B, B, _],
                [B, _, B, _, _, _, _],
                [_, A, _, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice2: GipfPartSlice = new GipfPartSlice(board2, 6, [5, 5], [0, 0]);
            expect(slice1.equals(slice2)).toBeFalse();
        });
    });
});
