/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Table, TableUtils, TableWithPossibleNegativeIndices } from '../TableUtils';
import { ArrayUtils, MGPOptional } from '@everyboard/lib';

describe('TableUtils', () => {

    describe('equals', () => {

        it('should notice different table sizes', () => {
            const shortBoard: Table<number> = [[1]];
            const longBoard: Table<number> = [[1], [2]];
            expect(TableUtils.equals(shortBoard, longBoard)).toBeFalse();
        });

        it('should delegate sub-list comparaison to ArrayUtils and return false if it does', () => {
            spyOn(ArrayUtils, 'equals').and.returnValue(false);
            const table: Table<number> = [[1], [2]];
            expect(TableUtils.equals(table, table)).toBeFalse();
        });

        it('should delegate sub-list comparaison to ArrayUtils and return true if ArrayUtils.compare always does', () => {
            spyOn(ArrayUtils, 'equals').and.returnValue(true);
            const table: Table<number> = [[1], [2]];
            expect(TableUtils.equals(table, table)).toBeTrue();
        });

    });

    describe('sum', () => {

        it('should add all element of a number table', () => {
            // Given any list of number
            const table: number[][] = [
                [11, 12, 13, 14, 15],
                [20, 19, 18, 17, 16],
            ];

            // When calling TableUtils.sum
            const sum: number = TableUtils.sum(table);

            // Then it should be correct
            expect(sum).toBe(155);
        });

    });

    describe('add', () => {

        it('should add elements of same index of a number table', () => {
            // Given two element
            const left: Table<number> = [
                [+1, +2, +3],
                [+4, +2, +6],
                [-1, -2, -3],
            ];
            const right: Table<number> = [
                [+1, -2, +9],
                [-2, +1, +1],
                [-5, -1, +3],
            ];

            // When adding them
            const sum: Table<number> = TableUtils.add(left, right);

            // Then the result should be the sum of same-coorded-place
            expect(sum).toEqual([
                [2, 0, 12],
                [2, 3, 7],
                [-6, -3, 0],
            ]);
        });

    });

    describe('getLefterMatch', () => {

        it('should return -1 when there is no match', () => {
            // Given a board without 0
            const table: Table<number> = [[1, 1, 1]];

            // When asking lefter match of value 0
            const result: number = TableUtils.getLefterMatch(table, (element: number) => element === 0);

            // Then the result should be -1
            expect(result).toBe(-1);
        });

        it('should return index when there is a match', () => {
            // Given a board with a 0 in index 0
            const table: Table<number> = [[0, 1, 1]];

            // When asking lefter match of value 0
            const result: number = TableUtils.getLefterMatch(table, (element: number) => element === 0);

            // Then the result should be 0 (since it is the first index)
            expect(result).toBe(0);
        });

    });

});

describe('Table2DWithPossibleNegativeIndices', () => {

    it('should return empty when accessing a non existing element', () => {
        // Given a table
        const table: TableWithPossibleNegativeIndices<number> = new TableWithPossibleNegativeIndices();
        // When getting an element that does not exist
        const element: MGPOptional<number> = table.get(new Coord(0, 0));
        // Then it should be empty
        expect(element.isAbsent()).toBeTrue();
    });

    it('should return the accessed element after it has been set', () => {
        // Given a table with a set element
        const table: TableWithPossibleNegativeIndices<number> = new TableWithPossibleNegativeIndices();
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
        const table: TableWithPossibleNegativeIndices<number> = new TableWithPossibleNegativeIndices();
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
