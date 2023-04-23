/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { ArrayUtils, NumberTable, Table2DWithPossibleNegativeIndices } from '../ArrayUtils';
import { MGPOptional } from '../MGPOptional';

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
});

describe('Table2DWithPossibleNegativeIndices', () => {
    it('should return empty when accessing a non existing element', () => {
        // Given a table
        const table: Table2DWithPossibleNegativeIndices<number> = new Table2DWithPossibleNegativeIndices();
        // When getting an element that does not exist
        const element: MGPOptional<number> = table.get(new Coord(0, 0));
        // Then it should be empty
        expect(element.isAbsent()).toBeTrue();
    });
    it('should return the accessed element after it has been set', () => {
        // Given a table with a set element
        const table: Table2DWithPossibleNegativeIndices<number> = new Table2DWithPossibleNegativeIndices();
        const somePiece: number = 42; // dummy value to represent something stored in the table
        table.set(new Coord(1, 2), somePiece);
        // When getting the element
        const element: MGPOptional<number> = table.get(new Coord(1, 2));
        // Then the element exists and is the same
        expect(element.isPresent()).toBeTrue();
        expect(element.get()).toBe(somePiece);
    });
    it('should iterate over elements in order', () => {
        // Given a table with multiple elements
        const table: Table2DWithPossibleNegativeIndices<number> = new Table2DWithPossibleNegativeIndices();
        table.set(new Coord(0, 0), 1);
        table.set(new Coord(0, 1), 2);
        table.set(new Coord(1, 1), 3);
        // When iterating over the elements
        const seen: number[] = [];
        for (const cell of table) {
            seen.push(cell.content);
        }
        // Then it should have seen ys from low to high, and xs from low to high
        expect(seen).toEqual([1, 2, 3]);
    });
});
