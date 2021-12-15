import { Table } from '../utils/ArrayUtils';
import { Utils } from '../utils/utils';
import { Coord } from './Coord';
import { GameStateWithTable } from './GameStateWithTable';
import { HexaDirection } from './HexaDirection';
import { HexaLine } from './HexaLine';

export abstract class HexagonalGameState<P> extends GameStateWithTable<P> {

    public static neighbors(coord: Coord, distance: number): Coord[] {
        return [
            new Coord(coord.x + distance, coord.y - distance),
            new Coord(coord.x + distance, coord.y),
            new Coord(coord.x - distance, coord.y + distance),
            new Coord(coord.x - distance, coord.y),
            new Coord(coord.x, coord.y + distance),
            new Coord(coord.x, coord.y - distance),
        ];
    }
    public constructor(turn: number,
                       public readonly board: Table<P>,
                       public readonly width: number,
                       public readonly height: number,
                       public readonly excludedCases: ReadonlyArray<number>,
                       public readonly empty: P)
    {
        super(board, turn);
        if (this.excludedCases.length >= (this.height/2)+1) {
            throw new Error('Invalid excluded cases specification for HexagonalGameState.');
        }
    }
    public abstract setAtUnsafe(coord: Coord, v: P): this
    public setAt(coord: Coord, v: P): this {
        if (this.isOnBoard(coord)) {
            return this.setAtUnsafe(coord, v);
        } else {
            throw new Error('Setting coord not on board: ' + coord + '.');
        }
    }
    public equalsT(other: HexagonalGameState<P>, equal: (a: P, b: P) => boolean): boolean {
        if (this === other) {
            return true;
        }
        if (this.width !== other.width) {
            return false;
        }
        if (this.height !== other.height) {
            return false;
        }
        if (equal(this.empty, other.empty) === false) {
            return false;
        }
        if (this.excludedCases.length !== other.excludedCases.length) {
            return false;
        }
        for (let i: number = 0; i < this.excludedCases.length; i++) {
            if (this.excludedCases[i] !== other.excludedCases[i]) {
                return false;
            }
        }
        for (const coord of this.allCoords()) {
            if (equal(this.getPieceAt(coord), other.getPieceAt(coord)) === false) {
                return false;
            }
        }
        return true;
    }
    public allCoords(): Coord[] {
        const coords: Coord[] = [];
        this.forEachCoord((coord: Coord) => {
            coords.push(coord);
        });
        return coords;
    }
    public allLines(): ReadonlyArray<HexaLine> {
        const lines: HexaLine[] = [];
        for (let i: number = 0; i < this.width; i++) {
            lines.push(HexaLine.constantQ(i));
        }
        for (let i: number = 0; i < this.height; i++) {
            lines.push(HexaLine.constantR(i));
        }
        for (let i: number = this.excludedCases.length; i < this.height+this.excludedCases.length; i++) {
            lines.push(HexaLine.constantS(i));
        }
        return lines;
    }
    public getEntranceOnLine(line: HexaLine): Coord {
        let x: number;
        let y: number;
        switch (line.constant) {
            case 'q':
                if (this.excludedCases[line.offset] != null) {
                    y = this.excludedCases[line.offset];
                } else {
                    y = 0;
                }
                return this.findEntranceFrom(line, new Coord(line.offset, y));
            case 'r':
                if (this.excludedCases[line.offset] != null) {
                    x = this.excludedCases[line.offset];
                } else {
                    x = 0;
                }
                return this.findEntranceFrom(line, new Coord(x, line.offset));
            case 's':
                if (line.offset < this.width) {
                    return this.findEntranceFrom(line, new Coord(line.offset, 0));
                } else {
                    return this.findEntranceFrom(line, new Coord(this.width-1, line.offset-this.width+1));
                }
        }
    }
    private findEntranceFrom(line: HexaLine, start: Coord): Coord {
        const dir: HexaDirection = line.getDirection();
        let coord: Coord = start;
        for (let i: number = 0; i < Math.max(this.width, this.height); i++) {
            if (this.isOnBoard(coord)) {
                return coord;
            }
            coord = coord.getNext(dir);
        }
        Utils.handleError('could not find a board entrance, board must be invalid');
        return new Coord(-1, -1);
    }
}
