import { Sets } from './Sets';

describe('Sets', () => {
    it('Should remove doublon with number', () => {
        const withDoublon: number[] = [0, 1, 2, 2];

        const asSet: number[] = Sets.toNumberSet(withDoublon);

        expect(asSet).toEqual([0, 1, 2]);
    });
});
