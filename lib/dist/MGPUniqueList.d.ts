import { Comparable } from './Comparable';
import { MGPSet } from './MGPSet';
/**
 * This is a list that contains each element only once.
 * It is an ordered set.
 */
export declare class MGPUniqueList<T extends Comparable> extends MGPSet<T> {
    equals(other: MGPUniqueList<T>): boolean;
    get(index: number): T;
    /**
      * Get element starting to count from the end (0 for the last)
      * @param index the index of the element to fetch, starting from the end (0 as last)
      */
    getFromEnd(index: number): T;
}
