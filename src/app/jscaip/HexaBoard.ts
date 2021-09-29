import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { assert } from '../utils/utils';
import { Coord } from './Coord';
import { HexaDirection } from './HexaDirection';
import { HexaLine } from './HexaLine';

/** An hexagonal board encoding,
    inspired by the description on this page: https://www.redblobgames.com/grids/hexagons/#map-storage */
export class HexaBoard<T> {

    public static empty<T>(width: number,
                           height: number,
                           excludedCases: ReadonlyArray<number>,
                           empty: T)
    : HexaBoard<T>
    {
        return new HexaBoard(ArrayUtils.createBiArray(width, height, empty),
                             width,
                             height,
                             excludedCases,
                             empty);
    }
    public static fromTable<T>(table: Table<T>,
                               excludedCases: ReadonlyArray<number>,
                               empty: T)
    : HexaBoard<T>
    {
        const height: number = table.length;
        if (height === 0) {
            throw new Error('Cannot create an HexaBoard from an empty table.');
        }
        const width: number = table[0].length;
        return new HexaBoard(table, width, height, excludedCases, empty);
    }
    public static isOnBoard(coord: Coord,
                            width: number,
                            height: number,
                            excludedCases: ReadonlyArray<number>)
    : boolean
    {
        const halfHeight: number = height / 2 | 0;
        if (coord.x < 0 || coord.x >= width || coord.y < 0 || coord.y >= height) {
            return false;
        }
        if (coord.y < halfHeight) {
            if (excludedCases[coord.y] != null) {
                return coord.x > excludedCases[coord.y]-1;
            } else {
                return true;
            }
        } else if (coord.y > halfHeight) {
            if (excludedCases[height-1 - coord.y] != null) {
                return (width-1-coord.x) > excludedCases[height-1 - coord.y]-1;
            } else {
                return true;
            }
        } else {
            if (excludedCases[coord.y] != null) {
                return coord.x > excludedCases[coord.y]-1 && (width-1-coord.x) > excludedCases[height-1 - coord.y]-1;
            } else {
                return true;
            }
        }
    }
    public static neighbors(coord: Coord, distance: number): Coord[] {
        return [
            new Coord(coord.x+distance, coord.y-distance), new Coord(coord.x+distance, coord.y),
            new Coord(coord.x-distance, coord.y+distance), new Coord(coord.x-distance, coord.y),
            new Coord(coord.x, coord.y+distance), new Coord(coord.x, coord.y-distance),
        ];
    }
    public constructor(public readonly board: Table<T>,
                       public readonly width: number,
                       public readonly height: number,
                       public readonly excludedCases: ReadonlyArray<number>,
                       public readonly empty: T)
    {
        if (this.excludedCases.length >= (this.height/2)+1) {
            throw new Error('Invalid excluded cases specification for HexaBoard.');
        }
    }
    public equals(other: HexaBoard<T>, equalT: (a: T, b: T) => boolean): boolean {
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
            if (equalT(this.getAtUnsafe(coord), other.getAtUnsafe(coord)) === false) {
                return false;
            }
        }
        return true;
    }
    protected getAtUnsafe(coord: Coord): T {
        return this.board[coord.y][coord.x];
    }
    public getAt(coord: Coord): T {
        if (this.isOnBoard(coord)) {
            return this.getAtUnsafe(coord);
        } else {
            throw new Error('Accessing coord not on hexa board: ' + coord + '.');
        }
    }
    protected setAtUnsafe(coord: Coord, v: T): this {
        const contents: T[][] = ArrayUtils.copyBiArray(this.board);
        contents[coord.y][coord.x] = v;
        // Here we want to return an object of the current type (could be a child class of HexaBoard).
        // Hence, we call our constructor (this.constructor) with its expected arguments,
        // and cast it back to the "this" type. Without this line, we would have to redefine `setAtUnsafe`
        // in every child class

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new (<any> this.constructor)(contents, this.width, this.height, this.excludedCases, this.empty) as this;
    }
    public setAt(coord: Coord, v: T): this {
        if (this.isOnBoard(coord)) {
            return this.setAtUnsafe(coord, v);
        } else {
            throw new Error('Setting coord not on hexa board: ' + coord + '.');
        }
    }
    public forEachCoord(callback: (coord: Coord, content: T) => void): void {
        for (const [coord, content] of this.getCoordsAndContents()) {
            callback(coord, content);
        }
    }
    public getCoordsAndContents(): [Coord, T][] {
        const coordsAndContents: [Coord, T][] = [];
        for (let y: number = 0; y < this.height; y++) {
            for (let x: number = 0; x < this.width; x++) {
                const coord: Coord = new Coord(x, y);
                if (this.isOnBoard(coord)) {
                    coordsAndContents.push([coord, this.getAtUnsafe(coord)]);
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
    public isOnBoard(coord: Coord): boolean {
        return HexaBoard.isOnBoard(coord, this.width, this.height, this.excludedCases);
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
        for (let cur: Coord = start, i: number = 0;
            i < Math.max(this.width, this.height);
            cur = cur.getNext(dir), i++) {
            if (this.isOnBoard(cur)) {
                return cur;
            }
        }
        assert(false, 'could not find a board entrance, board must be invalid');
    }
}
