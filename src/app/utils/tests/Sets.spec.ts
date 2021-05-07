import { Coord } from 'src/app/jscaip/Coord';
import { Comparable, ComparableObject } from '../Comparable';
import { Sets } from '../Sets';

describe('Sets', () => {
    it('Should remove doublon (with ComparableObject)', () => {
        const withDoublon: ComparableObject[] = [new Coord(0, 0), new Coord(0, 0), new Coord(1, 1)];

        const asSet: ComparableObject[] = Sets.toComparableObjectSet(withDoublon);

        expect(asSet).toEqual([new Coord(0, 0), new Coord(1, 1)]);
    });
    it('Should remove doublon (with Comparable)', () => {
        const withDoublon: Comparable[] = [1, 2, 1];

        const asSet: Comparable[] = Sets.toComparableSet(withDoublon);

        expect(asSet).toEqual([1, 2]);
    });
});
