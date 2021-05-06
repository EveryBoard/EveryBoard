import { KamisadoColor } from './KamisadoColor';
import { KamisadoPiece } from './KamisadoPiece';
import { ArrayUtils, Table, NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';

export class KamisadoBoard {
    public static INITIAL: Table<KamisadoPiece> = KamisadoBoard.getInitialBoard();
    public static SIZE: number = 8;
    private static COLORS: Table<KamisadoColor> = ArrayUtils.mapBiArray([
        [1, 2, 3, 4, 5, 6, 7, 8],
        [6, 1, 4, 7, 2, 5, 8, 3],
        [7, 4, 1, 6, 3, 8, 5, 2],
        [4, 3, 2, 1, 8, 7, 6, 5],
        [5, 6, 7, 8, 1, 2, 3, 4],
        [2, 5, 8, 3, 6, 1, 4, 7],
        [3, 8, 5, 2, 7, 4, 1, 6],
        [8, 7, 6, 5, 4, 3, 2, 1],
    ], KamisadoColor.of);

    public static getColorAt(x: number, y: number): KamisadoColor {
        return KamisadoBoard.COLORS[y][x];
    }
    public static getInitialBoard(): Table<KamisadoPiece> {
        const _: KamisadoPiece = KamisadoPiece.NONE;
        return [
            [1, 2, 3, 4, 5, 6, 7, 8].map(KamisadoPiece.ONE.of),
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [8, 7, 6, 5, 4, 3, 2, 1].map(KamisadoPiece.ZERO.of),
        ];
    }
    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(KamisadoBoard.SIZE, KamisadoBoard.SIZE);
    }
    public static getPieceAt(board: NumberTable, coord: Coord): KamisadoPiece {
        return KamisadoPiece.of(board[coord.y][coord.x]);
    }
    public static isEmptyAt(board: NumberTable, coord: Coord): boolean {
        return KamisadoBoard.getPieceAt(board, coord).equals(KamisadoPiece.NONE);
    }
    public static allPieceCoords(board: NumberTable): Coord[] {
        const l: Coord[] = [];
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[y].length; x++) {
                const coord: Coord = new Coord(x, y);
                if (!KamisadoBoard.isEmptyAt(board, coord)) {
                    l.push(coord);
                }
            }
        }
        return l;
    }
}
