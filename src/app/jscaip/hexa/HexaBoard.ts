import { ArrayUtils, NumberTable, Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Coord } from '../coord/Coord';
import { Encoder } from '../encoder';

/** An hexagonal board encoding,
    inspired by the description on this page: https://www.redblobgames.com/grids/hexagons/#map-storage */
export class HexaBoard<T> {
    public static empty<T>(width: number, height: number, empty: T, encoder: Encoder<T>): HexaBoard<T> {
        return new HexaBoard(ArrayUtils.createBiArray(width, height, empty), width, height, empty, encoder);
    }
    public static fromNumberTable<T>(table: NumberTable, empty: T, encoder: Encoder<T>): HexaBoard<T> {
        const contents: Table<T> = ArrayUtils.mapBiArray(table, encoder.decode);
        return HexaBoard.fromTable(contents, empty, encoder);
    }
    public static fromTable<T>(table: Table<T>, empty: T, encoder: Encoder<T>): HexaBoard<T> {
        const height: number = table.length;
        if (height === 0) {
            throw new Error('Cannot create an HexaBoard from an empty table');
        }
        const width: number = table[0].length;
        return new HexaBoard(table, width, height, empty, encoder);
    }
    private readonly widthRadius: number;
    private readonly heightRadius: number;
    public constructor(public readonly contents: Table<T>,
                       public readonly width: number,
                       public readonly height: number,
                       public readonly empty: T,
                       public readonly encoder: Encoder<T>) {
        if (width % 2 === 0) {
            throw new Error('Cannot create an HexaBoard with an even width');
        }
        if (height % 2 === 0) {
            throw new Error('Cannot create an HexaBoard with an even height');
        }
        this.heightRadius = (this.height - 1)/2;
        this.widthRadius = (this.width - 1)/2;
    }
    public equals(other: HexaBoard<T>, equalT: (a: T, b: T) => boolean): boolean {
        if (this === other) return true;
        if (this.width !== other.width) return false;
        if (this.height !== other.height) return false;
        if (equalT(this.empty, other.empty) === false) return false;
        if (this.encoder !== other.encoder) return false;
        for (const coord of this.allCoords()) {
            if (equalT(this.getAtUnsafe(coord), other.getAtUnsafe(coord)) === false) return false;
        }
        return true;
    }
    private getAtUnsafe(coord: Coord): T {
        return this.contents[coord.y+this.heightRadius][coord.x+this.widthRadius];
    }
    public getAt(coord: Coord): T {
        if (this.isOnBoard(coord)) {
            return this.getAtUnsafe(coord);
        } else {
            throw new Error('Accessing coord not on hexa board: ' + coord);
        }
    }
    public setAt(coord: Coord, v: T): HexaBoard<T> {
        const contents: T[][] = ArrayUtils.copyBiArray(this.contents);
        contents[coord.y+this.heightRadius][coord.x+this.widthRadius] = v;
        return new HexaBoard(contents, this.width, this.height, this.empty, this.encoder);
    }
    public toNumberTable(): NumberTable {
        return ArrayUtils.mapBiArray(this.contents, this.encoder.encode);
    }
    public forEachCoord(callback: (coord: Coord, content: T) => void): void {
        for (let q: number = -this.widthRadius; q <= this.widthRadius; q++) {
            const r1: number = Math.max(-this.heightRadius, -q - this.heightRadius);
            const r2: number = Math.min(this.heightRadius, -q + this.heightRadius);
            for (let r: number = r1; r <= r2; r++) {
                const coord: Coord = new Coord(q, r);
                callback(coord, this.getAt(coord));
            }
        }
    }
    public allCoords(): Coord[] {
        const coords: Coord[] = [];
        this.forEachCoord((coord: Coord, _content: T) => {
            coords.push(coord);
        });
        return coords;
    }
    public getAllBorders(): Coord[] {
        const coords: Coord[] = [];
        for (let q: number = -this.widthRadius; q <= this.widthRadius; q++) {
            const r1: number = Math.max(-this.heightRadius, -q - this.heightRadius);
            const r2: number = Math.min(this.heightRadius, -q + this.heightRadius);
            if (q === this.widthRadius || q === -this.widthRadius) {
                // This is the border with constant q, we need to add all cases
                for (let r: number = r1; r <= r2; r++) {
                    coords.push(new Coord(q, r));
                }
            } else {
                coords.push(new Coord(q, r1));
                coords.push(new Coord(q, r2));
            }
        }
        return coords;
    }
    public isOnBoard(coord: Coord): boolean {
        const q: number = coord.x;
        if (q < - this.widthRadius || q > this.widthRadius) return false;

        const r1: number = Math.max(-this.heightRadius, -q - this.heightRadius);
        const r2: number = Math.min(this.heightRadius, -q + this.heightRadius);
        const r: number = coord.y;
        if (r < r1 || r > r2) return false;
        return true;
    }
    public isOnBorder(coord: Coord): boolean {
        return this.isOnTopRightBorder(coord) ||
            this.isOnRightBorder(coord) ||
            this.isOnBottomRightBorder(coord) ||
            this.isOnBottomLeftBorder(coord) ||
            this.isOnLeftBorder(coord) ||
            this.isOnLeftBorder(coord) ||
            this.isOnTopLeftBorder(coord);
    }
    public isOnTopRightBorder(coord: Coord): boolean {
        return coord.y === -this.heightRadius;
    }
    public isOnRightBorder(coord: Coord): boolean {
        return coord.x === this.widthRadius;
    }
    public isOnBottomRightBorder(coord: Coord): boolean {
        return this.axialToCubeYCoordinate(coord) === -this.widthRadius;
    }
    public isOnBottomLeftBorder(coord: Coord): boolean {
        return coord.y === this.heightRadius;
    }
    public isOnLeftBorder(coord: Coord): boolean {
        return coord.x === -this.widthRadius;
    }
    public isOnTopLeftBorder(coord: Coord): boolean {
        return this.axialToCubeYCoordinate(coord) === this.widthRadius;
    }
    private axialToCubeYCoordinate(coord: Coord): number {
        return -coord.x-coord.y;
    }
    public isTopLeftCorner(coord: Coord): boolean {
        return coord.x === -this.widthRadius && coord.y === 0;
    }
    public isTopCorner(coord: Coord): boolean {
        return coord.x === 0 && coord.y === -this.heightRadius;
    }
    public isTopRightCorner(coord: Coord): boolean {
        return coord.x === this.widthRadius && coord.y === -this.heightRadius;
    }
    public isBottomRightCorner(coord: Coord): boolean {
        return coord.x === this.widthRadius && coord.y === 0;
    }
    public isBottomCorner(coord: Coord): boolean {
        return coord.x === 0 && coord.y === this.heightRadius;
    }
    public isBottomLeftCorner(coord: Coord): boolean {
        return coord.x === -this.widthRadius && coord.y === this.heightRadius;
    }
}

