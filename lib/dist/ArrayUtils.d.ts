import { Comparable } from './Comparable';
export declare class ArrayUtils {
    static create<T>(width: number, initValue: T): T[];
    static copy<T>(array: ReadonlyArray<T>): T[];
    static sortByDescending<T>(array: T[], by: (t: T) => number): void;
    static equals<T extends Comparable>(t1: ReadonlyArray<T>, t2: ReadonlyArray<T>): boolean;
    static isPrefix<T extends Comparable>(prefix: ReadonlyArray<T>, list: ReadonlyArray<T>): boolean;
    /**
     * range(n) returns the list [0, 1, 2, ..., n-1]
     * Enables doing *ngFor="let x in ArrayUtils.range(5)" in an Angular template
     */
    static range(n: number): number[];
    /**
     * A method that can be used to sort an array with the smallest number first with xs.sort(ArrayUtils.smallerFirst);
     */
    static smallerFirst(a: number, b: number): number;
    /**
     * Gets a random element from an array.
     * Throws if the array is empty.
     */
    static getRandomElement<T>(array: T[]): T;
    /**
     * Gets the maximum elements of an array, according to a given metric.
     * Returns an array containing all the maximal values
     */
    static maximumsBy<T>(array: T[], metric: (value: T) => number): T[];
    /**
     * Counts the number of element in an array that have the provided value
     */
    static count<T>(array: T[], value: T): number;
    /**
     * Check whether the first argument is strictly smaller than the second, element-wise
     */
    static isLessThan(inferior: ReadonlyArray<number>, superior: ReadonlyArray<number>): boolean;
    /**
     * Check whether the first argument is strictly greater than the second, element-wise.
     */
    static isGreaterThan(superior: ReadonlyArray<number>, inferior: ReadonlyArray<number>): boolean;
    /**
     * Return the minimal array (comparing element-wise) between two arrays.
     */
    static min(left: ReadonlyArray<number>, right: ReadonlyArray<number>): ReadonlyArray<number>;
    /**
     * Return the maximal array (comparing element-wise) between two arrays.
     */
    static max(left: ReadonlyArray<number>, right: ReadonlyArray<number>): ReadonlyArray<number>;
}
