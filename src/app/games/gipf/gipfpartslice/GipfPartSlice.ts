import { ArrayUtils, Table } from 'src/app/collectionlib/arrayutils/ArrayUtils';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { HexaBoard } from 'src/app/jscaip/hexa/HexaBoard';
import { Player } from 'src/app/jscaip/player/Player';
import { GipfPiece } from '../gipfpiece/GipfPiece';
import { GipfRules } from '../gipfrules/GipfRules';

export class GipfPartSlice extends GamePartSlice {
    public static getInitialSlice(): GipfPartSlice {
        const variant: 'basic' | 'standard' | 'tournament' = 'basic'; // TODO
        if (variant === 'basic') {
            const __: GipfPiece = GipfPiece.EMPTY;
            const A1: GipfPiece = GipfPiece.PLAYER_ZERO_SIMPLE;
            const B1: GipfPiece = GipfPiece.PLAYER_ONE_SIMPLE;
            const numberedBoard: Table<number> = ArrayUtils.mapBiArray([
                [__, __, __, A1, __, __, B1],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [B1, __, __, __, __, __, A1],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [A1, __, __, B1, __, __, __],
            ], GipfPiece.encoder.encode);
            const board: HexaBoard<GipfPiece> = HexaBoard.fromNumberTable(numberedBoard, __, GipfPiece.encoder);
            return new GipfPartSlice(board,
                                     0,
                                     [12, 12], [false, false], [0, 0]);
        } else if (variant === 'standard') {
            const __: GipfPiece = GipfPiece.EMPTY;
            const A2: GipfPiece = GipfPiece.PLAYER_ZERO_SIMPLE;
            const B2: GipfPiece = GipfPiece.PLAYER_ONE_SIMPLE;
            const numberedBoard: Table<number> = ArrayUtils.mapBiArray([
                [__, __, __, A2, __, __, B2],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [B2, __, __, __, __, __, A2],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [A2, __, __, B2, __, __, __],
            ], GipfPiece.encoder.encode);
            const board: HexaBoard<GipfPiece> = HexaBoard.fromNumberTable(numberedBoard, __, GipfPiece.encoder);
            return new GipfPartSlice(board,
                                     0,
                                     [12, 12], [false, false], [0, 0]);
        } else if (variant === 'tournament') {
            const __: GipfPiece = GipfPiece.EMPTY;
            const numberedBoard: Table<number> = ArrayUtils.mapBiArray([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
            ], GipfPiece.encoder.encode);
            const board: HexaBoard<GipfPiece> = HexaBoard.fromNumberTable(numberedBoard, __, GipfPiece.encoder);
            return new GipfPartSlice(board,
                                     0,
                                     [18, 18], [true, true], [0, 0]);
        }
    }
    public constructor(public hexaBoard: HexaBoard<GipfPiece>,
                       turn: number,
                       public sidePieces: [number, number],
                       public canPlaceDouble: [boolean, boolean],
                       public capturedPieces: [number, number]) {
        super(hexaBoard.toNumberTable(), turn);
    }

    public equals(other: GipfPartSlice): boolean {
        if (this === other) return true;
        if (this.turn !== other.turn) return false;
        if (this.sidePieces[0] !== other.sidePieces[0]) return false;
        if (this.sidePieces[1] !== other.sidePieces[1]) return false;
        if (this.canPlaceDouble[0] !== other.canPlaceDouble[0]) return false;
        if (this.canPlaceDouble[1] !== other.canPlaceDouble[1]) return false;
        if (this.capturedPieces[0] !== other.capturedPieces[0]) return false;
        if (this.capturedPieces[1] !== other.capturedPieces[1]) return false;
        if (this.hexaBoard.equals(other.hexaBoard, (p1: GipfPiece, p2: GipfPiece) => p1 === p2) === false) return false;
        return true;
    }

    public getNumberOfPiecesToPlace(player: Player): number {
        return this.sidePieces[player.value];
    }

    public getNumberOfPiecesCaptured(player: Player): number {
        return this.capturedPieces[player.value];
    }

    public playerCanStillPlaceDouble(player: Player): boolean {
        return this.canPlaceDouble[player.value];
    }

    public getDoublePiecesOnBoard(player: Player): number {
        let doubles: number = 0;
        this.hexaBoard.forEachCoord((_: Coord, content: GipfPiece) => {
            if (content.isDouble && content.player === player) {
                doubles += 1;
            }
        });
        return doubles;
    }
}
