import {Orthogonale, Direction} from './DIRECTION';

export class Coord {

    public readonly x: number;

    public readonly y: number;

    public static getBinarised(n: number): -1 | 0 | 1 {
        // return a value as -1 if negatif, 0 if nul, 1 if positive
        if (n < 0) {
            return -1;
        }
        if (n === 0) {
            return 0;
        }
        if (n > 0) {
            return 1;
        }
    }
    constructor(x: number, y: number) {
        if (x == null) throw new Error("X cannot be null");
        if (y == null) throw new Error("Y cannot be null");
        this.x = x;
        this.y = y;
    }
    public getNext(dir: Direction): Coord {
        // return the next coord in the direction 'dir'
        return new Coord(this.x + dir.x, this.y + dir.y);
    }
    public getPrevious(dir: Direction): Coord {
        return new Coord(this.x - dir.x, this.y - dir.y);
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
        const dx: number = Coord.getBinarised(c.x - this.x) + 1;
        const dy: number = Coord.getBinarised(c.y - this.y) + 1;
        return Direction.of(dx, dy);
    }
    public _getOrthogonalDirectionToward(c: Coord): Orthogonale {
        const dx: number = Coord.getBinarised(c.x - this.x) + 1;
        const dy: number = Coord.getBinarised(c.y - this.y) + 1;
        return // ORTH_ARRAY[dy][dx];
    }
    public getOrthogonalDistance(c: Coord): number {
        return Math.abs(this.x - c.x) + Math.abs(this.y - c.y);
    }
    public equals(obj: any): boolean {
        if (this === obj) return true;
        if (obj === null || obj === undefined) return false;
        // if (!(obj instanceof Coord)) return false;
        if (obj.x !== this.x) return false;
        if (this.y !== obj.y) return false;
        return true;
    }
    public toString(): string {
        return '(' + this.x + ', ' + this.y + ')';
    }
}