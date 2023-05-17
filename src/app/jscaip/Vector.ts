import { ComparableObject } from '../utils/Comparable';

export class Vector implements ComparableObject {

    public constructor(public readonly x: number,
        public readonly y: number) {}

    public equals(other: Vector): boolean {
        return this.x === other.x && this.y === other.y;
    }
    public isDiagonalOfLength(length: number): boolean {
        return Math.abs(this.x) === length &&
               Math.abs(this.y) === length;
    }
    public toMinimalVector(): Vector {
        const absX: number = Math.abs(this.x);
        const absY: number = Math.abs(this.y);
        const maxAbs: number = Math.max(absX, absY);
        let greatestCommonDivider: number = 1;
        let divider: number = 2;
        while (divider <= maxAbs) {
            if (this.x % divider === 0 && this.y % divider === 0) {
                greatestCommonDivider = divider;
            }
            divider++;
        }
        return new Vector(this.x / greatestCommonDivider,
                          this.y / greatestCommonDivider);
    }
    /**
      * @param otherVector the other vector to add to this
      * @param times the number of time you want to add it
      * @returns the vector that is the sum of this vector and otherVector * times
     */
    public combine(otherVector: Vector, times: number = 1): Vector {
        const newX: number = this.x + (times * otherVector.x);
        const newY: number = this.y + (times * otherVector.y);
        return new Vector(newX, newY);
    }
    public toString(): string {
        return '(' + this.x + ', ' + this.y + ')';
    }
}
