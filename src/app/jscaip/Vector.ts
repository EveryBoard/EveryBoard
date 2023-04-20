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
    // public getOpposite(): Vector {
    //     return new Vector(-this.x, -this.y);
    // }
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
}
