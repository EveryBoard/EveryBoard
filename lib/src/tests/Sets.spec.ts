/* eslint-disable max-lines-per-function */
import { Combinatorics } from '../Combinatorics';
import { Comparable } from '../Comparable';
import { Set } from '../Set';
import { Sets } from '../Sets';

describe('Sets', () => {

    it('should remove duplicate (with Comparable)', () => {
        const withDuplicate: Comparable[] = [1, 2, 1];

        const asSet: Comparable[] = Sets.toComparableSet(withDuplicate);

        expect(asSet).toEqual([1, 2]);
    });

    describe('getSubsetsOfSize', () => {

        it('should delegate to Combinatorics.getSubsetsOfSize', () => {
            // Given any sets and size
            const set: Set<string> = new Set(['A']);
            const size: number = 1;
            spyOn(Combinatorics, 'getSubsetsOfSize').and.callThrough();

            // When callings Sets.getSubsetsOfSize(set, size)
            const result: string[][] = Sets.getSubsetsOfSize(set, size);

            // Then Combinatorics.getSubsetsOfSize should have been called with a list and return its results
            expect(Combinatorics.getSubsetsOfSize).toHaveBeenCalledWith(set.toList(), size);
            expect(result).toEqual([['A']]);
        });

    });

});
