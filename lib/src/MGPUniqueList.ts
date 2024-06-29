import { Comparable, comparableEquals } from './Comparable';
import { Set } from './Set';
import { Utils } from './Utils';

/**
 * This is a list that contains each element only once.
 * It is an ordered set.
 */
export class MGPUniqueList<T extends Comparable> extends Set<T> {

    public override equals(other: MGPUniqueList<T>): boolean {
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
        Utils.assert(index < this.values.length, 'MGPUniqueList: index out of bounds: ' + index);
        return this.values[index];
    }

    /**
      * Get element starting to count from the end (0 for the last)
      * @param index the index of the element to fetch, starting from the end (0 as last)
      */
    public getFromEnd(index: number): T {
        Utils.assert(index < this.values.length, 'MGPUniqueList: index (from end) out of bounds: ' + index);
        const lastIndex: number = this.values.length - 1;
        return this.get(lastIndex - index);
    }
}
