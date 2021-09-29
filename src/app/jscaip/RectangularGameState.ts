import { Coord } from './Coord';
import { ArrayUtils, Table } from '../utils/ArrayUtils';
import { GameState } from './GameState';

export abstract class RectangularGameState<P> extends GameState<Coord, P> {

    public constructor(public readonly board: Table<P>,
                       turn: number)
    {
        super(turn);
        if (board == null) throw new Error('Board cannot be null.');
    }
    // Getters

    public getNullable(coord: Coord): P | null {
        if (0 <= coord.y && coord.y < this.board.length &&
            0 <= coord.x && coord.x < this.board[coord.y].length)
        {
            return this.board[coord.y][coord.x];
        } else {
            return null;
        }
    }
    public getBoardByXY(x: number, y: number): P {
        if (0 <= y && y < this.board.length &&
            0 <= x && x < this.board[y].length)
        {
            return this.board[y][x];
        } else {
            throw new Error('Out of range coord: (' + x + ', ' + y + ').');
        }
    }
    public getBoardAt(c: Coord): P {
        return this.getBoardByXY(c.x, c.y);
    }
    // Methods:

    public getCopiedBoard(): P[][] {
        return ArrayUtils.copyBiArray(this.board);
    }
    public equals(other: RectangularGameState<P>): boolean {
        throw new Error('Method uneeded yet' + other.toString());
    }
    public toString(): string {
        return '(t:'+this.turn+') = ' + JSON.stringify(this.board);
    }
}
