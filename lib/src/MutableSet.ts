import { Comparable, comparableEquals } from './Comparable';
import { ImmutableSet } from './ImmutableSet';
import { AbstractSet } from './AbstractSet';

export class MutableSet<T extends Comparable> extends AbstractSet<T> {

    public toImmutableSet(): ImmutableSet<T> {
        return new ImmutableSet(this.toList());
    }

    public add(element: T): boolean {
        if (this.contains(element)) {
            return false;
        } else {
            this.values.push(element);
            return true;
        }
    }

    public addAll(otherSet: AbstractSet<T>): void {
        for (const element of otherSet) {
            this.add(element);
        }
    }

    /**
     * Remove an element from the set.
     * Returns true if something was actually removed, false otherwise.
     */
    public remove(element: T): boolean {
        for (let i: number = 0; i < this.values.length; i++) {
            if (comparableEquals(this.values[i], element)) {
                this.values.splice(i, 1);
                return true;
            }
        }
        return false;
    }

}
