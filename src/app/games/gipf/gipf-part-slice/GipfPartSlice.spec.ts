import { Coord } from 'src/app/jscaip/coord/Coord';
import { HexaBoard } from 'src/app/jscaip/hexa/HexaBoard';
import { Player } from 'src/app/jscaip/player/Player';
import { ArrayUtils, Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { GipfPiece } from '../gipf-piece/GipfPiece';
import { GipfPartSlice } from './GipfPartSlice';

describe('GipfPartSlice', () => {
    describe('some slice', () => {
        const __: GipfPiece = GipfPiece.EMPTY;
        const A1: GipfPiece = GipfPiece.PLAYER_ZERO_SIMPLE;
        const A2: GipfPiece = GipfPiece.PLAYER_ZERO_DOUBLE;
        const B1: GipfPiece = GipfPiece.PLAYER_ONE_SIMPLE;
        const B2: GipfPiece = GipfPiece.PLAYER_ONE_DOUBLE;
        const numberedBoard: Table<number> = ArrayUtils.mapBiArray([
            [__, __, __, __, __, __, __],
            [__, __, A1, A2, __, __, __],
            [__, B1, B2, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
        ], GipfPiece.encoder.encode);
        const board: HexaBoard<GipfPiece> = HexaBoard.fromNumberTable(numberedBoard, __, GipfPiece.encoder);
        const slice: GipfPartSlice = new GipfPartSlice(board, 5, [12, 10], [false, false], [5, 0]);

        it('should one double pieces for each player', () => {
            expect(slice.getDoublePiecesOnBoard(Player.ZERO)).toBe(1);
            expect(slice.getDoublePiecesOnBoard(Player.ONE)).toBe(1);
        })
    });

    describe('basic variant', () => {
      describe('initial slice', () => {
          const slice: GipfPartSlice = GipfPartSlice.getInitialSlice();
          it('should contain 3 simple pieces for each player', () => {
              let p0: number = 0;
              let p1: number = 0;
              slice.hexaBoard.forEachCoord((_: Coord, content: GipfPiece) => {
                  if (content !== GipfPiece.EMPTY) {
                      expect(content.isDouble).toBeFalse();
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
          it('should start with 12 placable pieces for each player', () => {
              expect(slice.getNumberOfPiecesToPlace(Player.ZERO)).toBe(12);
              expect(slice.getNumberOfPiecesToPlace(Player.ONE)).toBe(12);
          });
          it('should start with 0 captured pieces for each player', () => {
              expect(slice.getNumberOfPiecesCaptured(Player.ZERO)).toBe(0);
              expect(slice.getNumberOfPiecesCaptured(Player.ONE)).toBe(0);
          });
          it('should not allow player to place double pieces', () => {
              expect(slice.playerCanStillPlaceDouble(Player.ZERO)).toBeFalse();
              expect(slice.playerCanStillPlaceDouble(Player.ONE)).toBeFalse();
          });
      });
    });
});
