import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { HexaBoard } from 'src/app/jscaip/HexaBoard';
import { ArrayUtils, NumberTable, Table } from 'src/app/utils/ArrayUtils';
import { GipfPiece } from './GipfPiece';

export class GipfBoard extends HexaBoard<GipfPiece> {
    private static pieceEncoder: NumberEncoder<GipfPiece> = GipfPiece.encoder;

    public static of(table: Table<GipfPiece>): GipfBoard {
        return new GipfBoard(table);
    }

    public constructor(public readonly board: Table<GipfPiece>) {
        super(board, 7, 7, [3, 2, 1], GipfPiece.EMPTY);
    }
    public toNumberTable(): NumberTable {
        return ArrayUtils.mapBiArray(this.board, GipfBoard.pieceEncoder.encodeNumber);
    }
}
