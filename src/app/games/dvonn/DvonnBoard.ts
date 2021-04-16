import { ArrayUtils, NumberTable, Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { DvonnPieceStack } from './dvonn-piece-stack/DvonnPieceStack';
import { HexaBoard } from 'src/app/jscaip/hexa/HexaBoard';

export class DvonnBoard extends HexaBoard<DvonnPieceStack> {
    public static WIDTH: number = 11;
    public static HEIGHT: number = 5;
    public static EXCLUDED_CASES: ReadonlyArray<number> = [2, 1];
    public static neighbors(coord: Coord, distance: number): Coord[] {
        return [
            new Coord(coord.x+distance, coord.y-distance), new Coord(coord.x+distance, coord.y),
            new Coord(coord.x-distance, coord.y+distance), new Coord(coord.x-distance, coord.y),
            new Coord(coord.x, coord.y+distance), new Coord(coord.x, coord.y-distance),
        ];
    }
    public static isOnBoard(coord: Coord): boolean {
        return HexaBoard.isOnBoard(coord, DvonnBoard.WIDTH, DvonnBoard.HEIGHT, DvonnBoard.EXCLUDED_CASES);
    }
    /** Returns the following board:
    W B B B W W B D B
   B B W W W B B W B B
  B B B B W D B W W W W
   W W B W W B B B W W
    W D W B B W W W B
    */
    public static balancedBoard(): DvonnBoard {
        const _: DvonnPieceStack = DvonnPieceStack.EMPTY;
        const W: DvonnPieceStack = DvonnPieceStack.PLAYER_ZERO;
        const B: DvonnPieceStack = DvonnPieceStack.PLAYER_ONE;
        const D: DvonnPieceStack = DvonnPieceStack.SOURCE;
        const contents: Table<DvonnPieceStack> = [
            [_, _, W, B, B, B, W, W, B, D, B],
            [_, B, B, W, W, W, B, B, W, B, B],
            [B, B, B, B, W, D, B, W, W, W, W],
            [W, W, B, W, W, B, B, B, W, W, _],
            [W, D, W, B, B, W, W, W, B, _, _],
        ];
        return new DvonnBoard(contents);
    }

    public constructor(public readonly contents: Table<DvonnPieceStack>) {
        super(contents, DvonnBoard.WIDTH, DvonnBoard.HEIGHT, DvonnBoard.EXCLUDED_CASES, DvonnPieceStack.EMPTY);
    }
    protected setAtUnsafe(coord: Coord, v: DvonnPieceStack): this {
        const contents: DvonnPieceStack[][] = ArrayUtils.copyBiArray(this.contents);
        contents[coord.y][coord.x] = v;
        return new DvonnBoard(contents) as this;
    }
    public numberOfNeighbors(coord: Coord): number {
        return DvonnBoard.neighbors(coord, 1)
            .filter((c: Coord): boolean => this.isOnBoard(c) && this.getAt(c).isEmpty() === false)
            .length;
    }
    public getAllPieces(): Coord[] {
        const pieces: Coord[] = [];
        for (let y: number = 0; y < DvonnBoard.HEIGHT; y++) {
            for (let x: number = 0; x < DvonnBoard.WIDTH; x++) {
                const coord: Coord = new Coord(x, y);
                if (this.isOnBoard(coord) &&
                    this.getAt(coord).isEmpty() === false) {
                    pieces.push(coord);
                }
            }
        }
        return pieces;
    }
    public toNumberTable(): NumberTable {
        return ArrayUtils.mapBiArray(this.contents, DvonnPieceStack.encoder.encodeNumber);
    }
}
