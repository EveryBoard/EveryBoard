import { Coord } from 'src/app/jscaip/coord/Coord';
import { Encoder } from 'src/app/jscaip/encoder';
import { HexaBoard } from 'src/app/jscaip/hexa/HexaBoard';
import { Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { GipfPiece } from '../gipf-piece/GipfPiece';

export class GipfBoard extends HexaBoard<GipfPiece> {
    public readonly width: number = 7;
    public readonly height: number = 7;
    public readonly excludedCases: ReadonlyArray<number> = [3, 2, 1];
    public readonly empty: GipfPiece = GipfPiece.EMPTY;
    public readonly encoder: Encoder<GipfPiece> = GipfPiece.encoder;

    public static of(table: Table<GipfPiece>): GipfBoard {
        return HexaBoard.fromTable(table, [3, 2, 1], GipfPiece.EMPTY, GipfPiece.encoder);
    }

    // TODO: remove
    public static coordEncoder: Encoder<Coord> = new class extends Encoder<Coord> {
        public maxValue(): number {
            // TODO
            return 0;
        }
        public encode(coord: Coord): number {
            // TODO
            return 0;
        }
        public decode(encoded: number): Coord {
            return new Coord(null, null);
        }
    }
}
