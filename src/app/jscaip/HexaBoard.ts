import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { Coord } from './Coord';
import { HexaLine } from './HexaLine';

/** An hexagonal board encoding,
    inspired by the description on this page: https://www.redblobgames.com/grids/hexagons/#map-storage */
export class HexaBoard<T> {
    public static empty<T>(width: number,
                           height: number,
                           excludedCases: ReadonlyArray<number>,
                           empty: T): HexaBoard<T> {
        return new HexaBoard(ArrayUtils.createBiArray(width, height, empty),
                             width,
                             height,
                             excludedCases,
                             empty);
    }
    public static fromTable<T>(table: Table<T>,
                               excludedCases: ReadonlyArray<number>,
                               empty: T): HexaBoard<T> {
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
                            excludedCases: ReadonlyArray<number>): boolean {
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
            // coord.y = halfHeight
            console.log({x: coord.x, y: coord.y, excluded1: excludedCases[coord.y], excluded2: excludedCases[height-1 - coord.y]})
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

    public constructor(public readonly contents: Table<T>,
                       public readonly width: number,
                       public readonly height: number,
                       public readonly excludedCases: ReadonlyArray<number>,
                       public readonly empty: T) {
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
        // TODO: check excludedCases
        for (const coord of this.allCoords()) {
            if (equalT(this.getAtUnsafe(coord), other.getAtUnsafe(coord)) === false) {
                return false;
            }
        }
        return true;
    }
    private getAtUnsafe(coord: Coord): T {
        return this.contents[coord.y][coord.x];
    }
    public getAt(coord: Coord): T {
        if (this.isOnBoard(coord)) {
            return this.getAtUnsafe(coord);
        } else {
            throw new Error('Accessing coord not on hexa board: ' + coord + '.');
        }
    }
    protected setAtUnsafe(coord: Coord, v: T): this {
        const contents: T[][] = ArrayUtils.copyBiArray(this.contents);
        contents[coord.y][coord.x] = v;
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
        for (let y: number = 0; y < this.height; y++) {
            for (let x: number = 0; x < this.width; x++) {
                const coord: Coord = new Coord(x, y);
                if (this.isOnBoard(coord)) {
                    callback(coord, this.getAtUnsafe(coord));
                }
            }
        }
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
}
