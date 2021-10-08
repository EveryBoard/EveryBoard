import { Coord } from 'src/app/jscaip/Coord';
import { Comparable, ComparableObject } from '../Comparable';
import { Sets } from '../Sets';

describe('Sets', () => {

    it('Should remove duplicate (with ComparableObject)', () => {
        const withDuplicate: ComparableObject[] = [new Coord(0, 0), new Coord(0, 0), new Coord(1, 1)];

        const asSet: ComparableObject[] = Sets.toComparableObjectSet(withDuplicate);

        expect(asSet).toEqual([new Coord(0, 0), new Coord(1, 1)]);
    });
    it('Should remove duplicate (with Comparable)', () => {
        const withDuplicate: Comparable[] = [1, 2, 1];

        const asSet: Comparable[] = Sets.toComparableSet(withDuplicate);

        expect(asSet).toEqual([1, 2]);
    });
});
