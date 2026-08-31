/* eslint-disable max-lines-per-function */
import { Combinatorics } from '../Combinatorics';
import { Comparable, comparableEquals } from '../Comparable';

function expectUnorderedListOfUnorderedListsEqual<T extends Comparable>(expected: T[][], actual: T[][]): void {
    expect(actual.length).toBe(expected.length);
    const remainingExpected: T[][] = [...expected];
    for (const actualList of actual) {
        const index: number = remainingExpected.findIndex(
            (expectedList: T[]) => areUnorderedListsEqual(expectedList, actualList),
        );
        expect(index)
            .withContext(`Expected ${JSON.stringify(actualList)} to have a matching list`)
            .toBeGreaterThanOrEqual(0);

        if (index >= 0) {
            remainingExpected.splice(index, 1);
        }
    }
    expect(remainingExpected)
        .withContext('Some expected lists were not found')
        .toEqual([]);
}

function areUnorderedListsEqual<T extends Comparable>(expected: T[], actual: T[]): boolean {
    if (expected.length !== actual.length) {
        return false;
    }
    const remainingExpected: T[] = [...expected];
    for (const actualItem of actual) {
        const index: number = remainingExpected.findIndex(
            (expectedItem: T) => comparableEquals(expectedItem, actualItem),
        );
        if (index < 0) {
            return false;
        }
        remainingExpected.splice(index, 1);
    }
    return remainingExpected.length === 0;
}

describe('Combinatorics', () => {

    describe('getSubsetsOfSize', () => {

        it('should return all subsets of a given size', () => {
            const elements: number[] = [0, 1, 2];
            const subsets: number[][] = Combinatorics.getSubsetsOfSize(elements, 2);

            expect(subsets.length).toBe(3);
            const seen: number[] = [0, 0, 0];
            for (const subset of subsets) {
                expect(subset.length).toBe(2);
                for (const elem of subset) {
                    seen[elem] += 1;
                }
            }
            expect(seen).toEqual([2, 2, 2]);
        });

        it('should select all subsets of size 2', () => {
            // Given a list of 4 distinct objects
            const items: string[] = ['A', 'B', 'C', 'D'];
            const subsetSize: number = 2;

            // When getting subsets of size two
            const result: string[][] = Combinatorics.getSubsetsOfSize(items, subsetSize);

            // Then it should give 6 results
            const expected: string[][] = [
                ['A', 'B'],
                ['A', 'C'],
                ['A', 'D'],
                ['B', 'C'],
                ['B', 'D'],
                ['C', 'D'],
            ];
            expectUnorderedListOfUnorderedListsEqual(expected, result);
        });

        it('should return a list of singletons when asking for subset of size 1', () => {
            // Given a list of distinct objects
            const items: string[] = ['A', 'B', 'C'];
            const subsetSize: number = 1;

            // When selecting subsets of size 1
            const result: string[][] = Combinatorics.getSubsetsOfSize(items, subsetSize);

            // Then it should result in a list containing each original element as singletons
            const expected: string[][] = [
                ['A'],
                ['B'],
                ['C'],
            ];
            expectUnorderedListOfUnorderedListsEqual(expected, result);
        });

        it('should return one subset when asking for a subset size equal to the list size', () => {
            // Given a list of distinct objects
            const items: string[] = ['A', 'B', 'C'];
            const subsetSize: number = 3;

            // When asking for a subset of size equal to the size of the list
            const result: string[][] = Combinatorics.getSubsetsOfSize(items, subsetSize);

            // Then it should return only one subset
            const expected: string[][] = [
                ['A', 'B', 'C'],
            ];
            expectUnorderedListOfUnorderedListsEqual(expected, result);
        });

        it('should return empty list when asking for subset of size 0', () => {
            // Given a list of distinct objects
            const items: string[] = ['A', 'B', 'C'];
            const subsetSize: number = 0;

            // When asking for subset of size 0
            const result: string[][] = Combinatorics.getSubsetsOfSize(items, subsetSize);

            // Then it should return the only possible subset of size zero: an empty list !
            const expected: string[][] = [[]];
            expectUnorderedListOfUnorderedListsEqual(expected, result);
        });

        it('should return no subset when selecting more objects than available', () => {
            // Given a list of distinct objects
            const items: string[] = ['A', 'B', 'C'];
            const subsetSize: number = 4;

            // When selecting more objects than available
            const result: string[][] = Combinatorics.getSubsetsOfSize(items, subsetSize);

            // Then it should return no subsets
            expect(result).toEqual([]);
        });

        it('should return no subset when selecting a negative number of objects', () => {
            // Given a list of distinct objects
            const items: string[] = ['A', 'B', 'C'];
            const subsetSize: number = -1;
            // When selecting a negative number of objects
            const result: string[][] = Combinatorics.getSubsetsOfSize(items, subsetSize);

            // Then it should return no subset
            expect(result).toEqual([[]]);
        });

        it('should return one empty combination when selecting zero objects on a empty list', () => {
            // Given an empty list
            const items: string[] = [];
            const subsetSize: number = 0;

            // When selecting zero objects
            const result: string[][] = Combinatorics.getSubsetsOfSize(items, subsetSize);

            // Then it should return one empty list
            expect(result).toEqual([[]]);
        });

        it('should return one empty combination when selecting one objects on a empty list', () => {
            // Given an empty list
            const items: string[] = [];
            const subsetSize: number = 1;

            // When selecting zero objects
            const result: string[][] = Combinatorics.getSubsetsOfSize(items, subsetSize);

            // Then it should return one empty list
            expect(result).toEqual([[]]);
        });
    });

    describe('getPermutations', () => {
        it('should return all permutations of a list', () => {
            const elements: number[] = [1, 2, 3];
            const permutations: number[][] = Combinatorics.getPermutations(elements);

            expect(permutations.length).toBe(3 * 2 * 1);
            for (const permutation of permutations) {
                expect(permutation.length).toBe(3);
                let sum: number = 0;
                for (const element of permutation) {
                    sum += element;
                }
                expect(sum).toBe(6);
            }
        });
    });

    describe('getCombinations', () => {
        it('should return all k-combinations of a list', () => {
            const elements: number[] = [0, 1, 2];
            const combinations: number[][] = Combinatorics.getCombinations(elements, 2);

            expect(combinations.length).toEqual(6);
            const seen: number[] = [0, 0, 0];
            for (const combination of combinations) {
                expect(combination.length).toBe(2);
                for (const element of combination) {
                    seen[element] += 1;
                }
            }
            expect(seen).toEqual([4, 4, 4]);
        });
    });

});
