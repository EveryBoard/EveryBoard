import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { HexaBoard } from 'src/app/jscaip/hexa/HexaBoard';
import { Player } from 'src/app/jscaip/player/Player';
import { ArrayUtils, Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { GipfPiece } from '../gipf-piece/GipfPiece';

export class GipfPartSlice extends GamePartSlice {
    public static getInitialSlice(): GipfPartSlice {
        const __: GipfPiece = GipfPiece.EMPTY;
        const A1: GipfPiece = GipfPiece.PLAYER_ZERO;
        const B1: GipfPiece = GipfPiece.PLAYER_ONE;
        const numberedBoard: Table<number> = ArrayUtils.mapBiArray([
            [__, __, __, B1, __, __, A1],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [A1, __, __, __, __, __, B1],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [B1, __, __, A1, __, __, __],
        ], GipfPiece.encoder.encode);
        const board: HexaBoard<GipfPiece> = HexaBoard.fromNumberTable(numberedBoard, __, GipfPiece.encoder);
        return new GipfPartSlice(board, 0, [12, 12], [0, 0]);
    }
    public constructor(public hexaBoard: HexaBoard<GipfPiece>, turn: number,
                       public sidePieces: [number, number],
                       public capturedPieces: [number, number]) {
        super(hexaBoard.toNumberTable(), turn);
    }

    public equals(other: GipfPartSlice): boolean {
        if (this === other) return true;
        if (this.turn !== other.turn) return false;
        if (this.sidePieces[0] !== other.sidePieces[0]) return false;
        if (this.sidePieces[1] !== other.sidePieces[1]) return false;
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
}
