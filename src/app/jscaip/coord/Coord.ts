import { Direction} from '../DIRECTION';
import { Comparable } from '../../collectionlib/Comparable';

export class Coord implements Comparable {

    public static getBinarised(n: number): -1 | 0 | 1 {
        // return a value as -1 if negatif, 0 if nul, 1 if positive
        if (n < 0) return -1;
        if (n === 0) return 0;
        if (n > 0) return 1;
    }
    constructor(
        public readonly x: number,
        public readonly y: number)
    {
        if (x == null) throw new Error("X cannot be null.");
        if (y == null) throw new Error("Y cannot be null.");
    }
    public getNext(dir: Direction, distance?: number): Coord {
        // return the next coord in the direction 'dir'
        distance = distance == null ? 1 : distance;
        const newX: number = this.x + (distance * dir.x);
        const newY: number = this.y + (distance * dir.y);
        return new Coord(newX, newY);
    }
    public getPrevious(dir: Direction, distance?: number): Coord {
        distance = distance == null ? 1 : distance;
        return this.getNext(dir, -distance);
    }
    public getLeft(dir: Direction): Coord {
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
        const newX = this.x +  dir.y;
        const newY = this.y + -dir.x; // (this.x, thix.y) + (dir.y, -dir.x)
        return new Coord(newX, newY);
    }
    public getRight(dir: Direction): Coord {
        // looking in the direction "dir", we just go one step right
        // see getLeft's logic, it's the opposite
        const newX = this.x + -dir.y;
        const newY = this.y +  dir.x; // (this.x, thix.y) + (-dir.y, dir.x)
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
    public getDirectionToward(c: Coord): Direction {
        const dx: number = Coord.getBinarised(c.x - this.x);
        const dy: number = Coord.getBinarised(c.y - this.y);
        return Direction.of(dx, dy); // TODO: method might have to be deleted in favor of Direction.fromMove
    }
    public getOrthogonalDistance(c: Coord): number {
        return Math.abs(this.x - c.x) + Math.abs(this.y - c.y);
    }
    public getDistance(c: Coord): number { // TODO: Rename, it's not really a distance
        if (!c.isAlignedWith(this)) {
            throw new Error("Cannot calculate distance with non aligned coords.");
        }
        const dx: number = Math.abs(c.x - this.x);
        const dy: number = Math.abs(c.y - this.y);
        return Math.max(dx, dy);
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
        const undividedVector: Coord = new Coord(dx, dy);
        return undividedVector.toVector();
    }
    public getCoordsToward(c: Coord): Coord[] {
        if (c.equals(this)) return [];
        if (!c.isAlignedWith(this)) return [];
        const dir: Direction = this.getDirectionToward(c);
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
        const aToThis: Coord = a.getVectorToward(this);
        const bToThis: Coord = b.getVectorToward(this);
        return aToThis.equals(bToThis.getOpposite());
    }
    // Override

    public equals(obj: any): boolean {
        if (this === obj) return true;
        if (!(obj instanceof Coord)) return false;
        if (obj.x !== this.x) return false;
        return (obj.y === this.y);
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
