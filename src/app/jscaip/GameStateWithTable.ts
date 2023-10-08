import { Table, TableUtils } from '../utils/ArrayUtils';
import { MGPOptional } from '../utils/MGPOptional';
import { Coord } from './Coord';
import { GameState } from './GameState';

export abstract class GameStateWithTable<P> extends GameState {

    public constructor(public readonly board: Table<P>, turn: number) {
        super(turn);
    }

    public getHeight(): number {
        return this.board.length;
    }

    public getWidth(): number {
        return this.board[0].length;
    }

    public getPieceAt(coord: Coord): P {
        if (this.isOnBoard(coord)) {
            return this.board[coord.y][coord.x];
        } else {
            throw new Error('Accessing coord not on board ' + coord + '.');
        }
    }

    public tryToGetPieceAt(coord: Coord): MGPOptional<P> {
        if (this.isOnBoard(coord)) {
            return MGPOptional.of(this.board[coord.y][coord.x]);
        } else {
            return MGPOptional.empty();
        }
    }

    public isOnBoard(coord: Coord): boolean {
        return coord.isInRange(this.board[0].length, this.board.length);
    }

    public getPieceAtXY(x: number, y: number): P {
        return this.getPieceAt(new Coord(x, y));
    }

    public forEachCoord(callback: (coord: Coord, content: P) => void): void {
        for (const { coord, content } of this.getCoordsAndContents()) {
            callback(coord, content);
        }
    }

    public getCoordsAndContents(): {coord: Coord, content: P}[] {
        const coordsAndContents: {coord: Coord, content: P}[] = [];
        for (let y: number = 0; y < this.board.length; y++) {
            for (let x: number = 0; x < this.board[y].length; x++) {
                const coord: Coord = new Coord(x, y);
                if (this.isOnBoard(coord)) {
                    coordsAndContents.push({
                        coord,
                        content: this.getPieceAt(coord),
                    });
                }
            }
        }
        return coordsAndContents;
    }

    public getCopiedBoard(): P[][] {
        return TableUtils.copy(this.board);
    }

    public toMap(): {key: Coord, value: P}[] {
        const elements: {key: Coord, value: P}[] = [];
        for (let y: number = 0; y < this.board.length; y++) {
            for (let x: number = 0; x < this.board[0].length; x++) {
                const coord: Coord = new Coord(x, y);
                elements.push({
                    key: coord,
                    value: this.getPieceAt(coord),
                });
            }
        }
        return elements;
    }

    [Symbol.iterator](): IterableIterator<P> {
        const linedUpElements: P[] = [];
        for (const lines of this.board) {
            linedUpElements.push(...lines);
        }
        return linedUpElements.values();
    }
}
