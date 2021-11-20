import { ArrayUtils, Table } from '../utils/ArrayUtils';
import { Coord } from './Coord';
import { GameState } from './GameState';

export abstract class GameStateWithTable<P> extends GameState {

    public constructor(public readonly board: Table<P>, turn: number) {
        super(turn);
    }
    public getPieceAt(coord: Coord): P {
        if (this.isOnBoard(coord)) {
            return this.board[coord.y][coord.x];
        } else {
            throw new Error('Accessing coord not on board ' + coord + '.');
        }
    }
    public isOnBoard(coord: Coord): boolean {
        return coord.isInRange(this.board[0].length, this.board.length);
    }
    public getPieceAtXY(x: number, y: number): P {
        return this.getPieceAt(new Coord(x, y));
    }
    public forEachCoord(callback: (coord: Coord, content: P) => void): void {
        for (const [coord, content] of this.getCoordsAndContents()) {
            callback(coord, content);
        }
    }
    public getCoordsAndContents(): [Coord, P][] {
        const coordsAndContents: [Coord, P][] = [];
        for (let y: number = 0; y < this.board.length; y++) {
            for (let x: number = 0; x < this.board[y].length; x++) {
                const coord: Coord = new Coord(x, y);
                if (this.isOnBoard(coord)) {
                    coordsAndContents.push([coord, this.getPieceAt(coord)]);
                }
            }
        }
        return coordsAndContents;
    }
    public getCopiedBoard(): P[][] {
        return ArrayUtils.copyBiArray(this.board);
    }
}
