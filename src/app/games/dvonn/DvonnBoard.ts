import { Table, NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { DvonnPieceStack } from './dvonn-piece-stack/DvonnPieceStack';

export class DvonnBoard {
    public static WIDTH = 11;
    public static HEIGHT = 5;

    public static isOnBoard(coord: Coord): boolean {
        if (coord.isNotInRange(DvonnBoard.WIDTH, DvonnBoard.HEIGHT)) {
            return false;
        }
        // Also check if this is not one of the unreachable positions
        // invalid positions: (0, 0), (0, 1), (1, 0)
        //                    (10, 4), (10, 3), (9, 4)
        if ((coord.x === 0 && coord.y <= 1) ||
            (coord.x === 1 && coord.y === 0)) {
            // unreachable in the top left
            return false;
        }
        if ((coord.x === DvonnBoard.WIDTH-1 && coord.y >= DvonnBoard.HEIGHT-2) ||
            (coord.x === DvonnBoard.WIDTH-2 && coord.y === DvonnBoard.HEIGHT-1)) {
            // unreachable in the top right
            return false;
        }
        return true;
    }

    public static getStackAt(board: NumberTable, coord: Coord): DvonnPieceStack {
        if (!DvonnBoard.isOnBoard(coord)) {
            throw new Error('Position is not within the board');
        }
        return DvonnPieceStack.of(board[coord.y][coord.x]);
    }

    public static neighbors(coord: Coord, distance: number): Coord[] {
        return [
            new Coord(coord.x+distance, coord.y-distance), new Coord(coord.x+distance, coord.y),
            new Coord(coord.x-distance, coord.y+distance), new Coord(coord.x-distance, coord.y),
            new Coord(coord.x, coord.y+distance), new Coord(coord.x, coord.y-distance),
        ];
    }
    public static numberOfNeighbors(board: NumberTable, coord: Coord): number {
        return DvonnBoard.neighbors(coord, 1)
            .filter((c: Coord): boolean => DvonnBoard.isOnBoard(c) && !DvonnBoard.getStackAt(board, c).isEmpty())
            .length;
    }

    public static getAllPieces(board: NumberTable): Coord[] {
        const pieces: Coord[] = [];
        for (let y = 0; y < DvonnBoard.HEIGHT; y++) {
            for (let x = 0; x < DvonnBoard.WIDTH; x++) {
                const coord = new Coord(x, y);
                if (DvonnBoard.isOnBoard(coord) &&
                    !DvonnBoard.getStackAt(board, coord).isEmpty()) {
                    pieces.push(coord);
                }
            }
        }
        return pieces;
    }

    /** Returns the following board:
    W B B B W W B D B
   B B W W W B B W B B
  B B B B W D B W W W W
   W W B W W B B B W W
    W D W B B W W W B
    */
    public static getBalancedBoard(): Table<DvonnPieceStack> {
        const _ = DvonnPieceStack.EMPTY;
        const W = DvonnPieceStack.PLAYER_ZERO;
        const B = DvonnPieceStack.PLAYER_ONE;
        const D = DvonnPieceStack.SOURCE;
        return [
            [_, _, W, B, B, B, W, W, B, D, B],
            [_, B, B, W, W, W, B, B, W, B, B],
            [B, B, B, B, W, D, B, W, W, W, W],
            [W, W, B, W, W, B, B, B, W, W, _],
            [W, D, W, B, B, W, W, W, B, _, _]];
    }
}
