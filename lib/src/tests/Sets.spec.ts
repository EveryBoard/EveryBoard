/* eslint-disable max-lines-per-function */
import { Comparable } from '../Comparable';
import { Sets } from '../Sets';

describe('Sets', () => {

    it('should remove duplicate (with Comparable)', () => {
        const withDuplicate: Comparable[] = [1, 2, 1];

        const asSet: Comparable[] = Sets.toComparableSet(withDuplicate);

        expect(asSet).toEqual([1, 2]);
    });

});
