import { Direction, Vector } from 'src/app/jscaip/Direction';
import { assert, JSONObject, JSONValue, JSONValueWithoutArray } from 'src/app/utils/utils';
import { ComparableObject } from '../utils/Comparable';
import { MGPFallible } from '../utils/MGPFallible';
import { Encoder, NumberEncoder } from './Encoder';

export class Coord implements ComparableObject {

    public static encoder: Encoder<Coord> = new class extends Encoder<Coord> {
        public encode(coord: Coord): JSONValueWithoutArray {
            return { x: coord.x, y: coord.y };
        }
        public decode(encoded: JSONValue): Coord {
            const casted: JSONObject = encoded as JSONObject;
            assert(casted.x != null && typeof casted.x === 'number' &&
                casted.y != null && typeof casted.y === 'number', 'Invalid encoded coord');
            return new Coord(casted.x as number, casted.y as number);
        }
    }
    public static numberEncoder(width: number, height: number): NumberEncoder<Coord> {
        return NumberEncoder.tuple(
            [NumberEncoder.numberEncoder(width), NumberEncoder.numberEncoder(height)],
            (coord: Coord): [number, number] => [coord.x, coord.y],
            (fields: [number, number]): Coord => new Coord(fields[0], fields[1]),
        );
    }
    constructor(public readonly x: number,
                public readonly y: number)
    {
    }
    public getNext(dir: Vector, distance?: number): Coord {
        // return the next coord in the direction 'dir'
        distance = distance == null ? 1 : distance;
        const newX: number = this.x + (distance * dir.x);
        const newY: number = this.y + (distance * dir.y);
        return new Coord(newX, newY);
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
    public getOpposite(): Coord {
        return new Coord( -this.x, -this.y);
    }
    public getCopy(): Coord {
        return new Coord(this.x, this.y);
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
        if (!c.isAlignedWith(this)) {
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
    public getVectorToward(c: Coord): Coord {
        const dx: number = c.x - this.x;
        const dy: number = c.y - this.y;
        return new Coord(dx, dy);
    }
    public getMinimalVectorToward(c: Coord): Coord {
        const undividedVector: Coord = this.getVectorToward(c);
        return undividedVector.toVector();
    }
    public getCoordsToward(c: Coord): Coord[] {
        if (c.equals(this)) return [];
        if (!c.isAlignedWith(this)) return [];
        const dir: Direction = this.getDirectionToward(c).get();
        let coord: Coord = this.getNext(dir, 1);
        const coords: Coord[] = [];
        while (coord.equals(c) === false) {
            coords.push(coord);
            coord = coord.getNext(dir, 1);
        }
        return coords;
    }
    public toVector(): Coord {
        const absX: number = Math.abs(this.x);
        const absY: number = Math.abs(this.y);
        const minAbs: number = Math.max(absX, absY);
        let vx: number = this.x;
        let vy: number = this.y;
        let divider: number = 2;
        while (divider <= minAbs) {
            if (vx % divider === 0 && vy % divider === 0) {
                vx /= divider;
                vy /= divider;
            } else {
                divider++;
            }
        }
        return new Coord(vx, vy);
    }
    public isBetween(a: Coord, b: Coord): boolean {
        const aToThis: Coord = a.getMinimalVectorToward(this);
        const bToThis: Coord = b.getMinimalVectorToward(this);
        return aToThis.equals(bToThis.getOpposite());
    }
    // Override

    public equals(obj: Coord): boolean {
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
    public toString(): string {
        return '(' + this.x + ', ' + this.y + ')';
    }
}
