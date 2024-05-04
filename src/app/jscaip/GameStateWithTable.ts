import { MGPOptional, comparableEquals } from '@everyboard/lib';
import { Coord } from './Coord';
import { GameState } from './GameState';
import { Table, TableUtils } from './TableUtils';

export abstract class GameStateWithTable<P> extends GameState {

    public static setPieceAt<Q, T extends GameStateWithTable<Q>>(
        oldState: T,
        coord: Coord,
        value: Q,
        map: (oldState: T, newBoard: Table<Q>) => T)
    : T
    {
        const newBoard: Q[][] = oldState.getCopiedBoard();
        newBoard[coord.y][coord.x] = value;
        return map(oldState, newBoard);
    }

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

    public has(coord: Coord, value: P): boolean {
        return this.isOnBoard(coord) &&
               comparableEquals(this.getPieceAt(coord), value);
    }

    protected setPieceAtWithMap(coord: Coord, value: P, map: (oldState: this, newBoard: Table<P>) => this): this {
        return GameStateWithTable.setPieceAt(this, coord, value, map);
    }

    public tryToGetPieceAt(coord: Coord): MGPOptional<P> {
        if (this.isOnBoard(coord)) {
            return MGPOptional.of(this.board[coord.y][coord.x]);
        } else {
            return MGPOptional.empty();
        }
    }

    public isOnBoard(coord: Coord): boolean {
        const width: number = this.board[0].length;
        const height: number = this.board.length;
        return coord.isInRange(width, height);
    }

    public getPieceAtXY(x: number, y: number): P {
        return this.getPieceAt(new Coord(x, y));
    }

    public getOptionalPieceAtXY(x: number, y: number): MGPOptional<P> {
        const coord: Coord = new Coord(x, y);
        if (this.isOnBoard(coord)) {
            return MGPOptional.of(this.getPieceAt(coord));
        } else {
            return MGPOptional.empty();
        }
    }

    public getOptionalPieceAt(coord: Coord): MGPOptional<P> {
        return this.getOptionalPieceAtXY(coord.x, coord.y);
    }

    public forEachCoord(callback: (coord: Coord, content: P) => void): void {
        for (const { coord, content } of this.getCoordsAndContents()) {
            callback(coord, content);
        }
    }

    public getCoordsAndContents(): {coord: Coord, content: P}[] {
        const coordsAndContents: {coord: Coord, content: P}[] = [];
        for (let y: number = 0; y < this.getHeight(); y++) {
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
        for (let y: number = 0; y < this.getHeight(); y++) {
            for (let x: number = 0; x < this.getWidth(); x++) {
                const coord: Coord = new Coord(x, y);
                elements.push({
                    key: coord,
                    value: this.getPieceAt(coord),
                });
            }
        }
        return elements;
    }

    public getWidth(): number {
        return this.board[0].length;
    }

    public getHeight(): number {
        return this.board.length;
    }

    public isHorizontalEdge(coord: Coord): boolean {
        const maxY: number = this.getHeight() - 1;
        return coord.y === 0 || coord.y === maxY;
    }

    public isVerticalEdge(coord: Coord): boolean {
        const maxX: number = this.getWidth() - 1;
        return coord.x === 0 || coord.x === maxX;
    }

    public isEdge(coord: Coord): boolean {
        return this.isHorizontalEdge(coord) ||
               this.isVerticalEdge(coord);
    }

    public isCorner(coord: Coord): boolean {
        return this.isHorizontalEdge(coord) &&
               this.isVerticalEdge(coord);
    }

    [Symbol.iterator](): IterableIterator<P> {
        const linedUpElements: P[] = [];
        for (const lines of this.board) {
            linedUpElements.push(...lines);
        }
        return linedUpElements.values();
    }

}
