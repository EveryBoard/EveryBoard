import { Direction } from 'src/app/jscaip/Direction';
import { MGPFallible } from '../utils/MGPFallible';
import { Encoder } from '../utils/Encoder';
import { Vector } from './Vector';

export class CoordFailure {
    public static readonly OUT_OF_RANGE: (coord: Coord) => string = (coord: Coord) => `The coordinate ${ coord.toString() } is not on the board`;
}

export class Coord extends Vector {

    public static getEncoder<T extends Coord>(generator: (x: number, y: number) => T): Encoder<T> {
        return Encoder.tuple(
            [Encoder.identity<number>(), Encoder.identity<number>()],
            (coord: T): [number, number] => [coord.x, coord.y],
            (fields: [number, number]): T => generator(fields[0], fields[1]),
        );
    }
    public static encoder: Encoder<Coord> = Coord.getEncoder((x: number, y: number): Coord => new Coord(x, y));

    public constructor(x: number, y: number) {
        super(x, y);
    }
    public getNext(dir: Vector, distance?: number): Coord {
        const combinedVector: Vector = this.combine(dir, distance);
        return new Coord(combinedVector.x, combinedVector.y);
    }
    public getPrevious(dir: Vector, distance?: number): Coord {
        distance = distance == null ? 1 : distance;
        return this.getNext(dir, -distance);
    }
    public getLeft(dir: Vector): Coord {
        // looking in the direction "dir", we just go one step left
        // since the directions in DIRECTIONS are sorted in horlogic order,
        // we just need to take the one before the previous (-2/8 = -90°)
        // also, math logic seem's to suggest that (x, y) become (y, -x)
        // the second solution seem's better
        // (--) -> (-+)
        // (0-) -> (-0)
        // (+-) -> (--)
        // (+0) -> (0-)
        // (++) -> (+-)
        // (0+) -> (0+)
        // (-+) -> (++)
        // (-0) -> (0+)
        // ...
        const newX: number = this.x + dir.y;
        const newY: number = this.y + -dir.x; // (this.x, thix.y) + (dir.y, -dir.x)
        return new Coord(newX, newY);
    }
    public getRight(dir: Vector): Coord {
        // looking in the direction "dir", we just go one step right
        // see getLeft's logic, it's the opposite
        const newX: number = this.x + -dir.y;
        const newY: number = this.y + dir.x; // (this.x, thix.y) + (-dir.y, dir.x)
        return new Coord(newX, newY);
    }
    public isInRange(sizeX: number, sizeY: number): boolean {
        if (this.x < 0) {
            return false;
        }
        if (this.y < 0) {
            return false;
        }
        if (this.x >= sizeX) {
            return false;
        }
        if (this.y >= sizeY) {
            return false;
        }
        return true;
    }
    public isNotInRange(sizeX: number, sizeY: number): boolean {
        if (this.x < 0) {
            return true;
        }
        if (this.y < 0) {
            return true;
        }
        if (this.x >= sizeX) {
            return true;
        }
        if (this.y >= sizeY) {
            return true;
        }
        return false;
    }
    public getDirectionToward(c: Coord): MGPFallible<Direction> {
        return Direction.factory.fromMove(this, c);
    }
    public getOrthogonalDistance(c: Coord): number {
        return Math.abs(this.x - c.x) + Math.abs(this.y - c.y);
    }
    public getDistance(c: Coord): number {
        if (c.isAlignedWith(this) === false) {
            throw new Error('Cannot calculate distance with non aligned coords.');
        }
        const dx: number = Math.abs(c.x - this.x);
        const dy: number = Math.abs(c.y - this.y);
        return Math.max(dx, dy);
    }
    public isHexagonallyAlignedWith(coord: Coord): boolean {
        const sdx: number = this.x - coord.x;
        const sdy: number = this.y - coord.y;
        if (sdx === sdy) return false;
        if (sdx === -sdy) return true;
        if (sdx*sdy === 0) return true;
        return false;
    }
    public isAlignedWith(coord: Coord): boolean {
        const dx: number = Math.abs(this.x - coord.x);
        const dy: number = Math.abs(this.y - coord.y);
        if (dx === dy) return true;
        if (dx*dy === 0) return true;
        return false;
    }

    public isNeighborWith(coord: Coord): boolean {
        if (this.isAlignedWith(coord) === false) {
            return false;
        } else {
            return this.getDistance(coord) === 1;
        }
    }

    public getVectorToward(c: Coord): Vector {
        const dx: number = c.x - this.x;
        const dy: number = c.y - this.y;
        return new Vector(dx, dy);
    }
    public toVector(): Vector {
        return new Vector(this.x, this.y);
    }
    public getCoordsToward(c: Coord): Coord[] {
        if (c.equals(this)) return [];
        if (c.isAlignedWith(this) === false) return [];
        const dir: Direction = this.getDirectionToward(c).get();
        let coord: Coord = this.getNext(dir, 1);
        const coords: Coord[] = [];
        while (coord.equals(c) === false) {
            coords.push(coord);
            coord = coord.getNext(dir, 1);
        }
        return coords;
    }
    public getUntil(end: Coord): Coord[] {
        const coords: Coord[] = [];
        const direction: Direction = this.getDirectionToward(end).get();
        let c: Coord = this.getNext(direction);
        while (c.equals(end) === false) {
            coords.push(c);
            c = c.getNext(direction);
        }
        return coords;
    }
    public override equals(obj: Coord): boolean {
        if (this === obj) return true;
        if (obj.x !== this.x) return false;
        return obj.y === this.y;
    }
    public compareTo(c: Coord): number {
        if (c.y === this.y) {
            if (c.x === this.x) {
                return 0;
            }
            return this.x < c.x ? -1 : 1;
        }
        return this.y < c.y ? -1 : 1;
    }
    public toSVGPoint(): string {
        return this.x + ',' + this.y;
    }
}
