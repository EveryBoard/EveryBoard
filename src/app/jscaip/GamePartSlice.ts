import { Coord } from './coord/Coord';
import { Player } from './Player';
import { ArrayUtils, NumberTable } from '../collectionlib/arrayutils/ArrayUtils';

export abstract class GamePartSlice {

    public constructor(
        public readonly board: NumberTable,
        public readonly turn: number)
    {
        if (board == null) throw new Error("Board cannot be null.");
        if (turn == null) throw new Error("Turn cannot be null.");
    }
    // Getters

    public getBoardByXY(x: number, y: number): number {
        if (0 <= y && y < this.board.length &&
            0 <= x && x < this.board[y].length) {
            return this.board[y][x];
        } else {
            throw new Error("Out of range coord: (" + x + ", " + y + ").");
        }
    }
    public getBoardAt(c: Coord): number {
        return this.getBoardByXY(c.x, c.y);
    }
    // Methods:

    public getCopiedBoard(): number[][] {
        return ArrayUtils.copyBiArray(this.board);
    }
    public getCurrentPlayer(): Player {
        return this.turn % 2 === 0 ? Player.ZERO : Player.ONE;
    }
    public getCurrentEnnemy(): Player {
        return this.turn % 2 === 1 ? Player.ZERO : Player.ONE;
    }
    public toString(): String {
        return "(t:"+this.turn+") = " + JSON.stringify(this.board);
    }
}
