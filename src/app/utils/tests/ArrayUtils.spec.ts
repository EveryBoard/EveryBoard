/* eslint-disable max-lines-per-function */
import { ArrayUtils, NumberTable } from '../ArrayUtils';

describe('ArrayUtils', () => {

    describe('compareTable', () => {
        it('should notice different size board', () => {
            const shortBoard: NumberTable = [[1]];
            const longBoard: NumberTable = [[1], [2]];
            expect(ArrayUtils.compareTable(shortBoard, longBoard)).toBeFalse();
        });
        it('should deletage sub-list comparaison to ArrayUtils and return false if it does', () => {
            spyOn(ArrayUtils, 'compareArray').and.returnValue(false);
            const table: NumberTable = [[1], [2]];
            expect(ArrayUtils.compareTable(table, table)).toBeFalse();
        });
        it('should deletage sub-list comparaison to ArrayUtils and return true if compareArray does always', () => {
            spyOn(ArrayUtils, 'compareArray').and.returnValue(true);
            const table: NumberTable = [[1], [2]];
            expect(ArrayUtils.compareTable(table, table)).toBeTrue();
        });
    });
});
