import { Comparable, ComparableObject, comparableEquals } from './Comparable';
import { ArrayUtils } from './ArrayUtils';
import { Sets } from './Sets';
import { MGPOptional } from './MGPOptional';

export class Set<T extends Comparable> implements ComparableObject {

    protected values: T[];

    public constructor(values?: readonly T[]) {
        if (values === undefined) {
            this.values = [];
        } else {
            this.values = Sets.toComparableSet(values);
        }
    }

    public provideInstance<U extends Comparable>(values?: readonly U[]): this {
        const { constructor } = Object.getPrototypeOf(this);
        return new constructor(values);
    }

    public equals(other: Set<T>): boolean {
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
        const result: string[] = ArrayUtils.map(this.values, (v: T) => {
            if (v == null) {
                return 'null';
            } else {
                return v.toString();
            }
        });
        return '[' + result.join(', ') + ']';
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

    public findAnyCommonElement(other: Set<T>): MGPOptional<T> {
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
    public getMissingElementFrom(other: Set<T>): MGPOptional<T> {
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

    public union(otherSet: Set<T>): this {
        const values: T[] = this.toList().concat(otherSet.toList());
        return this.provideInstance(values);
    }

    public unionList(list: readonly T[]): this {
        return this.provideInstance<T>(list.concat(this.values));
    }

    public addElement(element: T): this {
        return this.provideInstance<T>(this.values.concat([element]));
    }

    public filter(f: (element: T) => boolean): this {
        return this.provideInstance<T>(this.toList().filter(f));
    }

    public removeElement(element: T): this {
        return this.filter((e: T) => comparableEquals(e, element) === false);
    }

    public map<V extends Comparable>(mapper: (element: T) => V): Set<V> {
        const result: V[] = ArrayUtils.map(this.values, mapper);
        return new Set<V>(result);
    }

    public flatMap<U extends Comparable>(f: (element: T) => Set<U>): Set<U> {
        let result: Set<U> = new Set();
        for (const element of this) {
            result = result.union(f(element));
        }
        return result;
    }

    public intersection(other: Set<T>): this {
        let result: this = this.provideInstance();
        for (const element of other) {
            if (this.contains(element)) {
                result = result.addElement(element);
            }
        }
        return result;
    }

}
