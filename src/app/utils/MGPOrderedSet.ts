import { Comparable, comparableEquals } from './Comparable';
import { MGPSet } from './MGPSet';

export class MGPOrderedSet<T extends Comparable> extends MGPSet<T> {

    // TODOTODO: override annotation ?
    public equals(other: MGPOrderedSet<T>): boolean {
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
    // TODOTODO: override annotation ?
    public get(index: number): T {
        if (index < 0) {
            index -= this.values.length;
        }
        return this.values[index];
    }
}
