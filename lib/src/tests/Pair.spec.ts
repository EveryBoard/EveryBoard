import { ComparableObject } from '../Comparable';

export class Pair implements ComparableObject {

    public constructor(public readonly first: number, public readonly second: number) {
    }

    public equals(other: Pair): boolean {
        return this.first === other.first && this.second === other.second;
    }

    public toString(): string {
        return `(${this.first}, ${this.second})`;
    }
}
