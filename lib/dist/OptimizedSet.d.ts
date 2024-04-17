import { Comparable } from './Comparable';
import { MGPSet } from './MGPSet';
/**
 * This is an optimized representation of sets.
 * It performs multi-level hashing and is suitable for types
 * that can be decomposed into multiple fields represented by numbers.
 */
export declare abstract class OptimizedSet<T extends Comparable> extends MGPSet<T> {
    private readonly valueMap;
    /**
     * This should be defined for each specialization of OptimizedSet.
     * It transforms a value into a list of fields.
     * There should be at least one field, which is the second element returned.
     * The first element returned is the list of other fields.
     */
    protected abstract toFields(value: T): [[number], number];
    constructor(values?: readonly T[]);
    add(element: T): boolean;
    contains(element: T): boolean;
    [Symbol.iterator](): IterableIterator<T>;
}
