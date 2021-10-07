import { ArrayUtils, NumberTable } from '../ArrayUtils';

describe('ArrayUtils', () => {

    describe('compareTable', () => {
        it('Should notice different size board', () => {
            const shortBoard: NumberTable = [[1]];
            const longBoard: NumberTable = [[1], [2]];
            expect(ArrayUtils.compareTable(shortBoard, longBoard)).toBeFalse();
        });
    });
});
