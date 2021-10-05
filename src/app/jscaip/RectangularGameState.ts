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
        if (this.isOnBoard(coord)) {
            return this.board[coord.y][coord.x];
        } else {
            return null;
        }
    }
    public isOnBoard(coord: Coord): boolean {
        return 0 <= coord.y && coord.y < this.board.length &&
               0 <= coord.x && coord.x < this.board[coord.y].length;
    }
    public getBoardByXY(x: number, y: number): P {
        return this.getBoardAt(new Coord(x, y));
    }
    public getBoardAt(c: Coord): P {
        if (this.isOnBoard(c)) {
            return this.board[c.y][c.x];
        } else {
            throw new Error('Out of range coord: (' + c.x + ', ' + c.y + ').');
        }
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
