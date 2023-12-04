/* eslint-disable max-lines-per-function */
import { ArrayUtils } from '../ArrayUtils';
import { Utils } from '../Utils';

describe('ArrayUtils', () => {

    describe('create', () => {
        it('should create an array of the given size only containing the element', () => {
            // When creating an array of a given size with a given initial value
            const array: number[] = ArrayUtils.create(4, 42);
            // Then the array has the size and value
            expect(array.length).toBe(4);
            expect(array).toEqual([42, 42, 42, 42]);
        });
    });

    describe('copy', () => {
        it('should make a copy', () => {
            // Given the copy of an array
            const array: number[] = ArrayUtils.create(4, 0);
            const copy: number[] = ArrayUtils.copy(array);
            // When modifying the copy
            copy[1] = 42;
            // Then it should not have modified the original array
            expect(array[1]).toBe(0);
        })
    });

    describe('sortByDescending', () => {
        it('should sort the array', () => {
            // Given an array and a key function
            const array: number[] = [0, 1, 2, 4, 2];
            const key: (n: number) => number = Utils.identity;
            // When sorting the array according to the key
            ArrayUtils.sortByDescending(array, key);
            // Then it should be sorted
            expect(array).toEqual([4, 2, 2, 1, 0]);
        });
    });

    describe('compare', () => {
        it('should return true for equal arrays', () => {
            expect(ArrayUtils.compare([0, 1, 2], [0, 1, 2])).toBeTrue();
        });
        it('should return false for different arrays', () => {
            expect(ArrayUtils.compare([0, 1, 2], [0, 1, 3])).toBeFalse();
            expect(ArrayUtils.compare([0, 1, 2], [0, 1])).toBeFalse();
        });
    });

    describe('isPrefix', () => {
        it('should be false when the prefix is longer than the list', () => {
            const prefix: number[] = [1, 2, 3];
            const list: number[] = [1];
            expect(ArrayUtils.isPrefix(prefix, list)).toBeFalse();
        });

        it('should be false when we the prefix is not a prefix', () => {
            const prefix: number[] = [1, 4];
            const list: number[] = [1, 2, 3];
            expect(ArrayUtils.isPrefix(prefix, list)).toBeFalse();
        });

        it('should be true when we have a prefix', () => {
            const prefix: number[] = [1, 2, 3];
            const list: number[] = [1, 2, 3, 4, 5];
            expect(ArrayUtils.isPrefix(prefix, list)).toBeTrue();
        });
    });

    describe('range', () => {
        it('should produce a range up to the argument (non inclusive)', () => {
            expect(ArrayUtils.range(5)).toEqual([0,1,2,3,4]);
        });
    });

    describe('smallerFirst', () => {
        it('should compare numbers to sort by smaller first', () => {
            // Given an array
            const array: number[] = [3, 2, 1, 0];
            // When sorting it with smallerFirst order
            array.sort(ArrayUtils.smallerFirst);
            // Then it should be sorted in increasing size
            expect(array).toEqual([0, 1, 2, 3]);
        });
    });

    describe('getRandomElement', () => {
        it('should give an element of the array', () => {
            expect(ArrayUtils.getRandomElement(ArrayUtils.range(5))).toBeLessThan(5);
        });
    });

    describe('maximumsBy', () => {
        fit('should extract the maximums', () => {
            // Given an array and a metric
            const array: number[] = [0, 1, 2, 3, 3];
            const metric: (value: number) => number = Utils.identity
            // When extracting the maximums
            const maximums: number[] = ArrayUtils.maximumsBy(array, metric);
            // Then it should return all the maximum elements
            expect(maximums).toEqual([3, 3]);
        });
    });

    describe('count', () => {
        it('should count the given value', () => {
            // Given an array
            const array: number[] = [0, 1, 2, 3, 3];
            // When counting the number of times an element is present
            const count: number = ArrayUtils.count(array, 3);
            // Then it should return the correct value
            expect(count).toBe(2);
        });
    });
});

