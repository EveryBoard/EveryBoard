import { Comparable, comparableEquals } from './Comparable';
import { MGPSet } from './MGPSet';

export class MGPOrderedSet<T extends Comparable> extends MGPSet<T> {

    public override equals(other: MGPOrderedSet<T>): boolean {
        if (other.size() !== this.size()) {
            return false;
        }
        for (let i: number = 0; i < this.size(); i ++) {
            const otherValue: T = other.get(i);
            const thisValue: T = this.get(i);
            if (comparableEquals(otherValue, thisValue) === false) {
                return false;
            }
        }
        return true;
    }
    public get(index: number): T {
        return this.values[index];
    }
    /**
      * Get element starting to count from the end (0 for the last)
      * @param index the index of the element to fetch, starting from the end (0 as last)
      */
    public getFromEnd(index: number): T {
        const lastIndex: number = this.values.length - 1;
        return this.get(lastIndex - index);
    }
}
