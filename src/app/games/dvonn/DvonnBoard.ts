import { Coord } from 'src/app/jscaip/coord/Coord';
import { DvonnPiece } from "./DvonnPiece";
import { DvonnPieceStack } from "./DvonnPieceStack";

export type DvonnBoardEncoded = ReadonlyArray<ReadonlyArray<number>>;
export type DvonnBoardT = ReadonlyArray<ReadonlyArray<DvonnPieceStack>>;

export class DvonnBoard {
    public static WIDTH: number = 11;
    public static HEIGHT: number = 5;

    public static isOnBoard(coord: Coord): boolean {
        if (!coord.isInRange(DvonnBoard.WIDTH, DvonnBoard.HEIGHT))
            return false;
        // Also check if this is not one of the unreachable positions
        // invalid positions: (0, 0), (0, 1), (1, 0)
        //                    (10, 4), (10, 3), (9, 4)
        if ((coord.x === 0 && coord.y <= 1) ||
            (coord.x === 1 && coord.y === 0))
            // unreachable in the top left
            return false;
        if ((coord.x === DvonnBoard.WIDTH-1 && coord.y >= DvonnBoard.HEIGHT-2) ||
            (coord.x === DvonnBoard.WIDTH-2 && coord.y === DvonnBoard.HEIGHT-1))
            // unreachable in the top right
            return false;
        return true;
    }

    public static getStackAt(board: DvonnBoardEncoded, coord: Coord): DvonnPieceStack {
        if (!DvonnBoard.isOnBoard(coord)) {
            throw new Error("Position is not within the board");
        }
        return DvonnPieceStack.of(board[coord.y][coord.x]);
    }

    public static neighbors(coord: Coord, distance: number): Coord[] {
        return [
            new Coord(coord.x+distance, coord.y-distance), new Coord(coord.x+distance, coord.y),
            new Coord(coord.x-distance, coord.y+distance), new Coord(coord.x-distance, coord.y),
            new Coord(coord.x, coord.y+distance), new Coord(coord.x, coord.y-distance)
        ];
    }
    public static numberOfNeighbors(board: DvonnBoardEncoded, coord: Coord): number {
        return DvonnBoard.neighbors(coord, 1)
            .filter((c: Coord): boolean => DvonnBoard.isOnBoard(c) && !DvonnBoard.getStackAt(board, c).isEmpty())
            .length
    }

    public static getAllPieces(board: DvonnBoardEncoded): Coord[] {
        const pieces: Coord[] = []
        for (let y = 0; y < DvonnBoard.HEIGHT; y++) {
            for (let x = 0; x < DvonnBoard.WIDTH; x++) {
                const coord = new Coord(x, y);
                if (DvonnBoard.isOnBoard(coord) &&
                    !DvonnBoard.getStackAt(board, coord).isEmpty())
                {
                    pieces.push(coord);
                }
            }
        }
        return pieces;
    }

    /** Returns the following board:
         0
      1   \ __
   2   \ __/w \__
    \ __/b \__/b \__
  3  /b \__/b \__/b \__
   \ \__/b \__/w \__/b \__
  4  /w \__/b \__/w \__/w \__
   \ \__/w \__/b \__/w \__/w \__
     /w \__/b \__/w \__/b \__/b \__
     \__/D \__/w \__/D \__/b \__/D \__
      | \__/w \__/w \__/b \__/w \__/b \
      0  | \__/b \__/b \__/w \__/b \__/
         1  | \__/b \__/b \__/w \__/b \
            2  | \__/w \__/b \__/w \__/
               3  | \__/w \__/w \__/w \
                  4  | \__/w \__/w \__/
                     5  | \__/b \__/|
                        6  | \__/|  10
                           7  |  9
                              8
    */
    public static getBalancedBoard(): DvonnBoardT {
        const _ = DvonnPieceStack.EMPTY;
        const W = DvonnPieceStack.PLAYER_ZERO;
        const B = DvonnPieceStack.PLAYER_ONE;
        const R = DvonnPieceStack.SOURCE;
        return [
            [_, _, W, B, B, B, W, W, B, R, B],
            [_, B, B, W, W, W, B, B, W, B, B],
            [B, B, B, B, W, R, B, W, W, W, W],
            [W, W, B, W, W, B, B, B, W, W, _],
            [W, R, W, B, B, W, W, W, B, _, _]];
    }
    public static getRandomBoard(): DvonnBoardT {
        throw new Error("NYI");
    }
}
