import { ArrayUtils } from './ArrayUtils';
import { Comparable, ComparableObject } from './Comparable';
import { MGPOptional } from './MGPOptional';
import { Sets } from './Sets';

export abstract class AbstractSet<T extends Comparable> implements ComparableObject {

    protected values: T[];

    public constructor(values?: readonly T[]) {
        if (values === undefined) {
            this.values = [];
        } else {
            this.values = Sets.toComparableSet(values);
        }
    }

    abstract provideInstance(values?: readonly T[]): AbstractSet<T>;

    public equals(other: AbstractSet<T>): boolean {
        if (other.size() !== this.size()) {
            return false;
        }
        for (const coord of this) {
            if (other.contains(coord) === false) {
                return false;
            }
        }
        return true;
    }

    public size(): number {
        return this.values.length;
    }

    public toString(): string {
        let result: string = '';
        for (const element of this) {
            if (element == null) {
                result += 'null, ';
            } else {
                result += element.toString() + ', ';
            }
        }
        return '[' + result.slice(0, -2) + ']';
    }

    public contains(element: T): boolean {
        return ArrayUtils.contains(this.values, element);
    }

    public toList(): T[] {
        return ArrayUtils.copy(this.values);
    }

    public getAnyElement(): MGPOptional<T> {
        if (this.size() > 0) {
            return MGPOptional.of(this.values[0]);
        } else {
            return MGPOptional.empty();
        }
    }

    public isEmpty(): boolean {
        return this.values.length === 0;
    }

    public hasElements(): boolean {
        return this.isEmpty() === false;
    }

    public findAnyCommonElement(other: AbstractSet<T>): MGPOptional<T> {
        for (const element of other) {
            if (this.contains(element)) {
                return MGPOptional.of(element);
            }
        }
        return MGPOptional.empty();
    }

    /**
     * @param other the "reference" set
     * @returns an empty optional is nothing miss in this set; the first element missing as an optional if there is one
     */
    public getMissingElementFrom(other: AbstractSet<T>): MGPOptional<T> {
        for (const element of other) {
            if (this.contains(element) === false) {
                return MGPOptional.of(element);
            }
        }
        return MGPOptional.empty();
    }

    [Symbol.iterator](): IterableIterator<T> {
        return this.values.values();
    }

}
