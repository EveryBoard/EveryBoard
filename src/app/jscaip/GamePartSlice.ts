import { Coord } from './Coord';
import { Player } from './Player';
import { ArrayUtils, NumberTable } from '../utils/ArrayUtils';

export abstract class GamePartSlice {

    public constructor(public readonly board: NumberTable,
                       public readonly turn: number)
    {
        if (board == null) throw new Error('Board cannot be null.');
        if (turn == null) throw new Error('Turn cannot be null.');
    }
    // Getters

    public getNullable(coord: Coord): number | null {
        if (0 <= coord.y && coord.y < this.board.length &&
            0 <= coord.x && coord.x < this.board[coord.y].length)
        {
            return this.board[coord.y][coord.x];
        } else {
            return null;
        }
    }
    public getBoardByXY(x: number, y: number): number {
        if (0 <= y && y < this.board.length &&
            0 <= x && x < this.board[y].length)
        {
            return this.board[y][x];
        } else {
            throw new Error('Out of range coord: (' + x + ', ' + y + ').');
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
        return Player.fromTurn(this.turn);
    }
    public getCurrentEnnemy(): Player {
        return this.turn % 2 === 1 ? Player.ZERO : Player.ONE;
    }
}
