/* eslint-disable max-lines-per-function */
import { ArrayUtils } from '../ArrayUtils';
import { TestUtils } from '../TestUtils';
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
        });
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

    describe('equals', () => {
        it('should return true for equal arrays', () => {
            expect(ArrayUtils.equals([0, 1, 2], [0, 1, 2])).toBeTrue();
        });
        it('should return false for different arrays', () => {
            expect(ArrayUtils.equals([0, 1, 2], [0, 1, 3])).toBeFalse();
            expect(ArrayUtils.equals([0, 1, 2], [0, 1])).toBeFalse();
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
            expect(ArrayUtils.range(5)).toEqual([0, 1, 2, 3, 4]);
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
        it('should extract the maximums', () => {
            // Given an array and a metric
            const array: number[] = [0, 3, 1, 2, 3];
            const metric: (value: number) => number = Utils.identity;
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

    describe('isGreaterThan && isLessThan', () => {

        function expectComparisonCorrectness(left: number[], status: '<' | '=' | '>', right: number[]): void {
            const actualIsGreaterThan: boolean = ArrayUtils.isGreaterThan(left, right);
            const actualIsLessThan: boolean = ArrayUtils.isLessThan(left, right);
            switch (status) {
                case '<':
                    expect(actualIsLessThan).toBeTrue();
                    expect(actualIsGreaterThan).toBeFalse();
                    break;
                case '=':
                    expect(actualIsLessThan).toBeFalse();
                    expect(actualIsGreaterThan).toBeFalse();
                    break;
                default:
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    Utils.assert(status === '>', 'should be >');
                    expect(actualIsLessThan).toBeFalse();
                    expect(actualIsGreaterThan).toBeTrue();
                    break;

            }
        }

        it('should discover superiority on short list', () => {
            // Given a list being superior in the early number
            const superior: number[] = [874797];
            // and another list being inferior in the early number
            const inferior: number[] = [Number.MIN_SAFE_INTEGER];

            // When comparing them
            // Then isGreaterThan should be true and isLessThan false
            expectComparisonCorrectness(superior, '>', inferior);
        });

        it('should discover superiority', () => {
            // Given a list being superior in the early number
            const superior: number[] = [3, 2, 1];
            // and another list being inferior in the early number
            const inferior: number[] = [2, 2, 1];

            // When comparing them
            // Then isGreaterThan should be true and isLessThan false
            expectComparisonCorrectness(superior, '>', inferior);
        });

        it('should discover inferiority', () => {
            // Given a list being inferior in the early number
            const inferior: number[] = [2, 2, 1];
            // and another list being superior in the early number
            const superior: number[] = [3, 2, 1];

            // When comparing them
            // Then isGreaterThan should be false and isLessThan true
            expectComparisonCorrectness(inferior, '<', superior);
        });

        it('should discover inferiority on short list', () => {
            // Given a list being inferior in the early number
            const inferior: number[] = [9876156];
            // and another list being superior in the early number
            const superior: number[] = [Number.MAX_SAFE_INTEGER];

            // When comparing them
            // Then isGreaterThan should be false and isLessThan true
            expectComparisonCorrectness(inferior, '<', superior);
        });

        it('should discover equality', () => {
            // Given two equal lists
            const left: number[] = [3, 2, 1];
            const right: number[] = [3, 2, 1];

            // When comparing them
            // Then isGreaterThan should be false and isLessThan false
            expectComparisonCorrectness(left, '=', right);
        });

        it('should discover equality on short list', () => {
            // Given two equal lists
            const left: number[] = [123456789];
            const right: number[] = [123456789];

            // When comparing them
            // Then isGreaterThan should be false and isLessThan false
            expectComparisonCorrectness(left, '=', right);
        });

        it('should throw with empty list (isGreaterThan)', () => {
            // Given one empty list and one normal
            // When comparing both list
            const reason: string = 'ArrayUtils.isLessThan/isGreaterThan should have two non-empty list as parameter';
            TestUtils.expectToThrowAndLog(() => {
                ArrayUtils.isGreaterThan([], [1]);
            }, reason);
        });

        it('should throw with empty list (isLessThan)', () => {
            // Given one empty list and one normal
            // When comparing both list
            const reason: string = 'ArrayUtils.isLessThan/isGreaterThan should have two non-empty list as parameter';
            TestUtils.expectToThrowAndLog(() => {
                ArrayUtils.isLessThan([], [1]);
            }, reason);
        });

    });
});

