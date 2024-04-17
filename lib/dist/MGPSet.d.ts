import { Comparable, ComparableObject } from './Comparable';
import { MGPOptional } from './MGPOptional';
export declare class MGPSet<T extends Comparable> implements ComparableObject {
    protected values: T[];
    constructor(values?: readonly T[]);
    equals(other: MGPSet<T>): boolean;
    toString(): string;
    add(element: T): boolean;
    /**
     * Remove an element from the set.
     * Returns true if something was actually removed, false otherwise.
     */
    remove(element: T): boolean;
    addAll(otherSet: MGPSet<T>): void;
    union(otherSet: MGPSet<T>): MGPSet<T>;
    contains(element: T): boolean;
    size(): number;
    toList(): T[];
    getAnyElement(): MGPOptional<T>;
    isEmpty(): boolean;
    hasElements(): boolean;
    map<V extends Comparable>(mapper: (element: T) => V): MGPSet<V>;
    flatMap<U extends Comparable>(f: (element: T) => MGPSet<U>): MGPSet<U>;
    filter(f: (element: T) => boolean): MGPSet<T>;
    findAnyCommonElement(other: MGPSet<T>): MGPOptional<T>;
    intersection(other: MGPSet<T>): MGPSet<T>;
    /**
     * @param other the "reference" set
     * @returns an empty optional is nothing miss in this set; the first element missing as an optional if there is one
     */
    getMissingElementFrom(other: MGPSet<T>): MGPOptional<T>;
    [Symbol.iterator](): IterableIterator<T>;
}
