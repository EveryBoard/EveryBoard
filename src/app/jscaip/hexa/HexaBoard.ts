import { ArrayUtils, NumberTable, Table } from 'src/app/collectionlib/arrayutils/ArrayUtils';
import { Coord } from '../coord/Coord';
import { Encoder } from '../encoder';

/** An hexagonal board encoding, following the description on this page: https://www.redblobgames.com/grids/hexagons/#map-storage */
export class HexaBoard<T> {
    public static empty<T>(radius: number, empty: T, encoder: Encoder<T>): HexaBoard<T> {
        return new HexaBoard(ArrayUtils.createBiArray(radius, radius, empty), empty, encoder);
    }

    public static fromNumberTable<T>(table: NumberTable, empty: T, encoder: Encoder<T>): HexaBoard<T> {
        const contents: Table<T> = ArrayUtils.mapBiArray(table, encoder.decode);
        return new HexaBoard(contents, empty, encoder);
    }

    private constructor(public readonly contents: Table<T>,
                        public readonly empty: T,
                        public readonly encoder: Encoder<T>) {
    }

    public radius(): number {
        return this.contents.length;
    }

    public getAt(coord: Coord): T {
        return this.contents[coord.y][coord.x];
    }

    public setAt(coord: Coord, v: T): HexaBoard<T> {
        const contents: T[][] = ArrayUtils.copyBiArray(this.contents);
        contents[coord.y][coord.x] = v;
        return new HexaBoard(contents, this.empty, this.encoder);
    }

    public toNumberTable(): NumberTable {
        return ArrayUtils.mapBiArray(this.contents, this.encoder.encode);
    }

    public forEachCoord(callback: (coord: Coord, content: T) => void): void {
        const radius: number = this.radius();
        for (let q = -radius; q <= radius; q++) {
            let r1: number = Math.max(-radius, -q - radius);
            let r2: number = Math.min(radius, -q + radius);
            for (let r = r1; r <= r2; r++) {
                const coord: Coord = new Coord(q, r);
                callback(coord, this.getAt(coord));
            }
        }
    }

    public getAllBorders(): Coord[] {
        let coords: Coord[] = [];
        const radius: number = this.radius();
        for (let q = -radius; q <= radius; q++) {
            const r1: number = Math.max(-radius, -q - radius);
            const r2: number = Math.min(radius, -q + radius);
            coords.push(new Coord(q, r1));
            coords.push(new Coord(q, r2));
        }
        return coords;
    }

    public isOnBoard(coord: Coord): boolean {
        const q: number = coord.x;
        const radius: number = this.radius();
        if (q < - radius || q > radius) return false;

        const r1: number = Math.max(-radius, -q - radius);
        const r2: number = Math.min(radius, -q + radius);
        const r: number = coord.y;
        if (r < r1 || r > r2) return false;
        return true
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
        return coord.y === -this.radius();
    }
    public isOnRightBorder(coord: Coord): boolean {
        return coord.x === this.radius();
    }
    public isOnBottomRightBorder(coord: Coord): boolean {
        return this.axialToCubeYCoordinate(coord) === -this.radius();
    }
    public isOnBottomLeftBorder(coord: Coord): boolean {
        return coord.y === this.radius();
    }
    public isOnLeftBorder(coord: Coord): boolean {
        return coord.x === -this.radius();
    }
    public isOnTopLeftBorder(coord: Coord): boolean {
        return this.axialToCubeYCoordinate(coord) === this.radius();
    }
    private axialToCubeYCoordinate(coord: Coord): number {
        return -coord.x-coord.y
    }

    public isTopLeftCorner(coord: Coord): boolean {
        return coord.x === -this.radius() && coord.y === 0;
    }
    public isTopCorner(coord: Coord): boolean {
        return coord.x === 0 && coord.y === -this.radius();
    }
    public isTopRightCorner(coord: Coord): boolean {
        return coord.x === this.radius() && coord.y === -this.radius();
    }
    public isBottomRightCorner(coord: Coord): boolean {
        return coord.x === this.radius() && coord.y === 0;
    }
    public isBottomCorner(coord: Coord): boolean {
        return coord.x === 0 && coord.y === this.radius();
    }
    public isBottomLeftCorner(coord: Coord): boolean {
        return coord.x === -this.radius() && coord.y === this.radius();
    }
}
