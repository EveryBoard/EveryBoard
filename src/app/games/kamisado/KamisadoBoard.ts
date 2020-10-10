import { KamisadoColor } from "./KamisadoColor";
import { KamisadoPiece } from "./KamisadoPiece";

export class KamisadoBoard {
    public static SIZE: number = 8;
    private static COLORS: ReadonlyArray<ReadonlyArray<KamisadoColor>> = [
        [1, 2, 3, 4, 5, 6, 7, 8].map(KamisadoColor.of),
        [6, 1, 4, 7, 2, 5, 8, 3].map(KamisadoColor.of),
        [7, 4, 1, 6, 3, 8, 5, 2].map(KamisadoColor.of),
        [4, 3, 2, 1, 8, 5, 4, 3].map(KamisadoColor.of),
        [5, 6, 7, 8, 1, 2, 3, 4].map(KamisadoColor.of),
        [2, 5, 8, 3, 6, 1, 4, 7].map(KamisadoColor.of),
        [3, 8, 5, 2, 7, 4, 1, 6].map(KamisadoColor.of),
        [8, 7, 6, 5, 4, 3, 2, 1].map(KamisadoColor.of)
    ]
    public static getColorAt(x: number, y: number): KamisadoColor {
        return KamisadoBoard.COLORS[y][x];
    }
    public static getInitialBoard(): ReadonlyArray<ReadonlyArray<KamisadoPiece>> {
        const _ = KamisadoPiece.NONE;
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
    public static INITIAL: ReadonlyArray<ReadonlyArray<KamisadoPiece>> = KamisadoBoard.getInitialBoard();
}