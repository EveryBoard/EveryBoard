/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { ArrayUtils, Table, TableUtils, TableWithPossibleNegativeIndices } from '../ArrayUtils';
import { MGPOptional } from '../MGPOptional';
import { TestUtils } from './TestUtils.spec';
import { Utils } from '../utils';

describe('ArrayUtils', () => {

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

    describe('isSuperior && isInferior', () => {

        function expectComparisonCorrectness(left: number[], status: '<' | '=' | '>', right: number[]): void {
            const actualIsSuperior: boolean = ArrayUtils.isSuperior(left, right);
            const actualIsInferior: boolean = ArrayUtils.isInferior(left, right);
            switch (status) {
                case '<':
                    expect(actualIsInferior).toBeTrue();
                    expect(actualIsSuperior).toBeFalse();
                    break;
                case '=':
                    expect(actualIsInferior).toBeFalse();
                    expect(actualIsSuperior).toBeFalse();
                    break;
                default:
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    Utils.assert(status === '>', 'should be =');
                    expect(actualIsInferior).toBeFalse();
                    expect(actualIsSuperior).toBeTrue();
                    break;

            }
        }

        it('should discover superiority on short list', () => {
            // Given a list being superior in the early number
            const superior: number[] = [874797];
            // and another list being inferior in the early number
            const inferior: number[] = [Number.MIN_SAFE_INTEGER];

            // When comparing them
            // Then isSuperior should be true and isInferior false
            expectComparisonCorrectness(superior, '>', inferior);
        });

        it('should discover superiority', () => {
            // Given a list being superior in the early number
            const superior: number[] = [3, 2, 1];
            // and another list being inferior in the early number
            const inferior: number[] = [2, 2, 1];

            // When comparing them
            // Then isSuperior should be true and isInferior false
            expectComparisonCorrectness(superior, '>', inferior);
        });

        it('should discover inferiority', () => {
            // Given a list being inferior in the early number
            const inferior: number[] = [2, 2, 1];
            // and another list being superior in the early number
            const superior: number[] = [3, 2, 1];

            // When comparing them
            // Then isSuperior should be false and isInferior true
            expectComparisonCorrectness(inferior, '<', superior);
        });

        it('should discover inferiority on short list', () => {
            // Given a list being inferior in the early number
            const inferior: number[] = [9876156];
            // and another list being superior in the early number
            const superior: number[] = [Number.MAX_SAFE_INTEGER];

            // When comparing them
            // Then isSuperior should be false and isInferior true
            expectComparisonCorrectness(inferior, '<', superior);
        });

        it('should discover equality', () => {
            // Given two equal lists
            const left: number[] = [3, 2, 1];
            const right: number[] = [3, 2, 1];

            // When comparing them
            // Then isSuperior should be false and isInferior false
            expectComparisonCorrectness(left, '=', right);
        });

        it('should discover equality on short list', () => {
            // Given two equal lists
            const left: number[] = [123456789];
            const right: number[] = [123456789];

            // When comparing them
            // Then isSuperior should be false and isInferior false
            expectComparisonCorrectness(left, '=', right);
        });

        it('should throw with empty list (isSuperior)', () => {
            // Given one empty list and one normal
            // When comparing both list
            const reason: string = 'ArrayUtils.isInferior/isSuperior should have two non-empty list as parameter';
            TestUtils.expectToThrowAndLog(() => {
                ArrayUtils.isSuperior([], [1]);
            }, reason);
        });

        it('should throw with empty list (isInferior)', () => {
            // Given one empty list and one normal
            // When comparing both list
            const reason: string = 'ArrayUtils.isInferior/isSuperior should have two non-empty list as parameter';
            TestUtils.expectToThrowAndLog(() => {
                ArrayUtils.isInferior([], [1]);
            }, reason);
        });

    });

    describe('maximumsBy', () => {

        it('should extract the maximums', () => {
            // Given an array and a metric
            const array: number[] = [0, 3, 1, 2, 3];
            const metric: (value: number) => number = Utils.identity;
            // When extracting the maximums
            const maximums: number[] = ArrayUtils.maximumsBy(array, metric);
            // Then it should return all the maximum elements
            expect(maximums).toEqual([3, 3]);
        });

    });

});

describe('TableUtils', () => {

    describe('equals', () => {

        it('should notice different table sizes', () => {
            const shortBoard: Table<number> = [[1]];
            const longBoard: Table<number> = [[1], [2]];
            expect(TableUtils.compare(shortBoard, longBoard)).toBeFalse();
        });

        it('should delegate sub-list comparaison to ArrayUtils and return false if it does', () => {
            spyOn(ArrayUtils, 'equals').and.returnValue(false);
            const table: Table<number> = [[1], [2]];
            expect(TableUtils.compare(table, table)).toBeFalse();
        });

        it('should delegate sub-list comparaison to ArrayUtils and return true if ArrayUtils.compare always does', () => {
            spyOn(ArrayUtils, 'equals').and.returnValue(true);
            const table: Table<number> = [[1], [2]];
            expect(TableUtils.compare(table, table)).toBeTrue();
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
