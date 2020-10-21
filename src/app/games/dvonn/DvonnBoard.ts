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
        if ((coord.x === 0 && coord.y <= 1) ||
            (coord.x === 1 && coord.y === 0))
            // unreachable in the top left
            return false;
        if ((coord.x === DvonnBoard.WIDTH-1 && coord.y <= DvonnBoard.HEIGHT-2) ||
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

    public static numberOfNeighbors(board: DvonnBoardEncoded, coord: Coord): number {
        const neighborCoords = [
            new Coord(coord.x+1, coord.y-1), new Coord(coord.x+1, coord.y+1),
            new Coord(coord.x-1, coord.y+1), new Coord(coord.x-1, coord.y-1),
            new Coord(coord.x, coord.y+1), new Coord(coord.x, coord.y-1)
        ];
        return neighborCoords
            .filter(c =>
                DvonnBoard.isOnBoard(c) && !DvonnBoard.getStackAt(board, c).isEmpty())
            .length;
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
        const W = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO]);
        const B = new DvonnPieceStack([DvonnPiece.PLAYER_ONE]);
        const R = new DvonnPieceStack([DvonnPiece.SOURCE]);
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
