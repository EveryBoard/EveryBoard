import { Table } from '../utils/ArrayUtils';
import { assert } from '../utils/utils';
import { Coord } from './Coord';
import { GameState } from './GameState';
import { HexaDirection } from './HexaDirection';
import { HexaLine } from './HexaLine';

export abstract class HexagonalGameState<P> extends GameState<Coord, P> {

    public static neighbors(coord: Coord, distance: number): Coord[] {
        return [
            new Coord(coord.x+distance, coord.y-distance), new Coord(coord.x+distance, coord.y),
            new Coord(coord.x-distance, coord.y+distance), new Coord(coord.x-distance, coord.y),
            new Coord(coord.x, coord.y+distance), new Coord(coord.x, coord.y-distance),
        ];
    }
    public constructor(turn: number,
                       public readonly board: Table<P>,
                       public readonly width: number,
                       public readonly height: number,
                       public readonly excludedCases: ReadonlyArray<number>,
                       public readonly empty: P)
    {
        super(turn);
        if (this.excludedCases.length >= (this.height/2)+1) {
            throw new Error('Invalid excluded cases specification for HexaBoard.');
        }
    }
    public equals(other: HexagonalGameState<P>, equalT: (a: P, b: P) => boolean): boolean {
        if (this === other) {
            return true;
        }
        if (this.width !== other.width) {
            return false;
        }
        if (this.height !== other.height) {
            return false;
        }
        if (equalT(this.empty, other.empty) === false) {
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
            if (equalT(this.getNullable(coord), other.getNullable(coord)) === false) {
                return false;
            }
        }
        return true;
    }
    public getNullable(coord: Coord): P {
        return this.board[coord.y][coord.x];
    }
    public getBoardAt(coord: Coord): P {
        if (this.isOnBoard(coord)) {
            return this.getNullable(coord);
        } else {
            throw new Error('Accessing coord not on hexa board: ' + coord + '.');
        }
    }
    public forEachCoord(callback: (coord: Coord, content: P) => void): void {
        for (const [coord, content] of this.getCoordsAndContents()) {
            callback(coord, content);
        }
    }
    public getCoordsAndContents(): [Coord, P][] {
        const coordsAndContents: [Coord, P][] = [];
        for (let y: number = 0; y < this.height; y++) {
            for (let x: number = 0; x < this.width; x++) {
                const coord: Coord = new Coord(x, y);
                if (this.isOnBoard(coord)) {
                    coordsAndContents.push([coord, this.getBoardAt(coord)]);
                }
            }
        }
        return coordsAndContents;
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
        let c: Coord = start;
        for (let i: number = 0; i < Math.max(this.width, this.height); i++) {
            if (this.isOnBoard(c)) {
                return c;
            }
            c = c.getNext(dir);
        }
        assert(false, 'could not find a board entrance, board must be invalid');
    }
}
