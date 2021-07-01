import { Coord } from 'src/app/jscaip/Coord';
import { HexaBoard } from 'src/app/jscaip/HexaBoard';
import { ArrayUtils, NumberTable, Table } from 'src/app/utils/ArrayUtils';
import { YinshPiece } from './YinshPiece';

export class YinshBoard extends HexaBoard<YinshPiece> {
    public static WIDTH: number = 11;
    public static HEIGHT: number = 11;
    public static EXCLUDED_CASES: ReadonlyArray<number> = [6, 4, 3, 2, 1];

    public static EMPTY: YinshBoard =
        new YinshBoard(ArrayUtils.createBiArray(YinshBoard.WIDTH, YinshBoard.HEIGHT, YinshPiece.EMPTY));

    public static isOnBoard(coord: Coord): boolean {
        return HexaBoard.isOnBoard(coord, YinshBoard.WIDTH, YinshBoard.HEIGHT, YinshBoard.EXCLUDED_CASES);
    }

    public constructor(public readonly contents: Table<YinshPiece>) {
        super(contents, YinshBoard.WIDTH, YinshBoard.HEIGHT, YinshBoard.EXCLUDED_CASES, YinshPiece.EMPTY);
    }
    public toNumberTable(): NumberTable {
        return ArrayUtils.mapBiArray(this.contents, YinshPiece.encoder.encodeNumber);
    }
}
