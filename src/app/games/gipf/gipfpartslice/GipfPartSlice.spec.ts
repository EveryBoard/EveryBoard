import { ArrayUtils, Table } from "src/app/collectionlib/arrayutils/ArrayUtils";
import { Coord } from "src/app/jscaip/coord/Coord";
import { HexaBoard } from "src/app/jscaip/hexa/HexaBoard";
import { Player } from "src/app/jscaip/player/Player";
import { GipfPiece } from "../gipfpiece/GipfPiece";
import { GipfPartSlice } from "./GipfPartSlice";

describe('GipfPartSlice', () => {
    describe('some slice', () => {
        let __: GipfPiece = GipfPiece.EMPTY;
        let A1: GipfPiece = GipfPiece.PLAYER_ZERO_SIMPLE;
        let A2: GipfPiece = GipfPiece.PLAYER_ZERO_DOUBLE;
        let B1: GipfPiece = GipfPiece.PLAYER_ONE_SIMPLE;
        let B2: GipfPiece = GipfPiece.PLAYER_ONE_DOUBLE;
        let numberedBoard: Table<number> = ArrayUtils.mapBiArray([
            [__, __, __, __, __, __, __],
            [__, __, A1, A2, __, __, __],
            [__, B1, B2, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
        ], GipfPiece.encoder.encode);
        let board: HexaBoard<GipfPiece> = HexaBoard.fromNumberTable(numberedBoard, __, GipfPiece.encoder);
        let slice: GipfPartSlice = new GipfPartSlice(board, 5, [12, 10], [false, false], [5, 0]);

        it('should one double pieces for each player', () => {
            expect(slice.getDoublePiecesOnBoard(Player.ZERO)).toBe(1);
            expect(slice.getDoublePiecesOnBoard(Player.ONE)).toBe(1);
        })
    });

    describe('initial slice', () => {
        let slice: GipfPartSlice = GipfPartSlice.getInitialSlice();
        it('should be completely empty', () => {
            slice.hexaBoard.forEachCoord((_: Coord, content: GipfPiece) => {
                expect(content).toBe(GipfPiece.EMPTY);
            });
        });
        it('should start at turn 0', () => {
            expect(slice.turn).toBe(0);
        });
        it('should start with 15 placable pieces for each player', () => {
            expect(slice.getNumberOfPiecesToPlace(Player.ZERO)).toBe(15);
            expect(slice.getNumberOfPiecesToPlace(Player.ONE)).toBe(15);
        });
        it('should start with 0 captured pieces for each player', () => {
            expect(slice.getNumberOfPiecesCaptured(Player.ZERO)).toBe(0);
            expect(slice.getNumberOfPiecesCaptured(Player.ONE)).toBe(0);
        });
        it('should allow player to place double pieces', () => {
            expect(slice.playerCanStillPlaceDouble(Player.ZERO)).toBeTrue();
            expect(slice.playerCanStillPlaceDouble(Player.ONE)).toBeTrue();
        });
    });
});
