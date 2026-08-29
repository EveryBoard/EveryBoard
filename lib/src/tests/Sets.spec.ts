/* eslint-disable max-lines-per-function */
import { Combinatorics } from '../Combinatorics';
import { Comparable } from '../Comparable';
import { Set } from '../Set';
import { Sets } from '../Sets';

fdescribe('Sets', () => {

    it('should remove duplicate (with Comparable)', () => {
        const withDuplicate: Comparable[] = [1, 2, 1];

        const asSet: Comparable[] = Sets.toComparableSet(withDuplicate);

        expect(asSet).toEqual([1, 2]);
    });

    describe('getSubsetsOfSize', () => {

        it('should select all subsets of size 2', () => {
            // Given a list of distinct objects
            const items: Set<string> = new Set(['A', 'B', 'C', 'D']);
            const subsetSize: number = 2;

            // When getting subsets of size two
            const result: string[][] = Sets.getSubsetsOfSize(items, subsetSize);

            // Then it should give 6 results
            const expected: string[][] = [
                ['A', 'B'],
                ['A', 'C'],
                ['A', 'D'],
                ['B', 'C'],
                ['B', 'D'],
                ['C', 'D'],
            ];
            expect(result.equals(expected)).toBeTrue();
        });

        it('should return equivalent list when asking for subset of size 1', () => {
            // Given a list of distinct objects
            const items: Set<string> = new Set(['A', 'B', 'C']);
            const subsetSize: number = 1;

            // When selecting subsets of size 1
            const result: string[][] = Sets.getSubsetsOfSize(items, subsetSize);

            // Then it should result in the initial list
            const expected: string[][] = [
                ['A'],
                ['B'],
                ['C'],
            ];
            expect(result.equals(expected)).toBeTrue();
        });

        it('should return one subset of equal size when asking for a subset size equal to the list size', () => {
            // Given a list of distinct objects
            const items: Set<string> = new Set(['A', 'B', 'C']);
            const subsetSize: number = 3;

            // When asking for a subset of size equal to the size of the list
            const result: string[][] = Sets.getSubsetsOfSize(items, subsetSize);

            // Then it should return only one subset
            const expected: string[][] = [
                ['A', 'B', 'C'],
            ];
            expect(result.equals(expected)).toBeTrue();
        });

        it('should return empty list when asking for subset of size 0', () => {
            // Given a list of distinct objects
            const items: Set<string> = new Set(['A', 'B', 'C']);
            const subsetSize: number = 0;

            // When asking for subset of size 0
            const result: string[][] = Sets.getSubsetsOfSize(items, subsetSize);

            // Then it should return an empty list
            const expected: string[][] = [[]];
            expect(result.equals(expected)).toBeTrue();
        });

        it('should return no subset when selecting more objects than available', () => {
            // Given a list of distinct objects
            const items: Set<string> = new Set(['A', 'B', 'C']);
            const subsetSize: number = 4;

            // When selecting more objects than available
            const result: string[][] = Sets.getSubsetsOfSize(items, subsetSize);

            // Then it should return an empty list
            expect(result).toEqual([]);
        });

        it('should return no subset when selecting a negative number of objects', () => {
            // Given a list of distinct objects
            const items: Set<string> = new Set(['A', 'B', 'C']);
            const subsetSize: number = -1;
            // When selecting a negative number of objects
            const result: string[][] = Sets.getSubsetsOfSize(items, subsetSize);

            // Then it should return no subset
            expect(result).toEqual([]);
        });

        it('should return one empty combination when selecting zero objects on a empty list', () => {
            // Given an empty list
            const items: Set<string> = new Set([]);
            const subsetSize: number = 0;

            // When selecting zero objects
            const result: string[][] = Sets.getSubsetsOfSize(items, subsetSize);

            // Then it should return one empty list
            expect(result).toEqual([[]]);
        });

        it('should return one empty combination when selecting one objects on a empty list', () => {
            // Given an empty list
            const items: Set<string> = new Set([]);
            const subsetSize: number = 1;

            // When selecting zero objects
            const result: string[][] = Sets.getSubsetsOfSize(items, subsetSize);

            // Then it should return one empty list
            expect(result).toEqual([[]]);
        });

        fit('should delegate to Combinatorics.getSubsetsOfSize', () => {
            // Given any sets and size
            const set: Set<string> = new Set(['A', 'B', 'C']);
            const combinatoricsResult: string[][] = [['mocked value']]
            spyOn(Combinatorics, 'getSubsetsOfSize').andResolveTo(combinatoricsResult);

            // When callings Sets.getSubsetsOfSize(set, size)
            const result: string[][] = Sets.getSubsetsOfSize(set, 2);

            // Then Combinatorics.getSubsetsOfSize should have been called
            expect(result).toBe(combinatoricsResult);
        });

    });

});
