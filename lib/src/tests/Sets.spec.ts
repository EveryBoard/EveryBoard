/* eslint-disable max-lines-per-function */
import { Comparable } from '../Comparable';
import { Sets } from '../Sets';

describe('Sets', () => {

    it('should remove duplicate (with Comparable)', () => {
        const withDuplicate: Comparable[] = [1, 2, 1];

        const asSet: Comparable[] = Sets.toComparableSet(withDuplicate);

        expect(asSet).toEqual([1, 2]);
    });

    describe('getSubset', () => {

        it('When selecting 2 objects from 4, Then it should return all unique Sets.getSubset', () => {
            // Given a list of distinct objects
            const items: string[] = ['A', 'B', 'C', 'D'];
            const subsetSize: number = 2;

            // When getting two a subset of two
            const result: string[][] = Sets.getSubset(items, subsetSize);
            // Then
            const expected: string[][] = [
                ['A', 'B'],
                ['A', 'C'],
                ['A', 'D'],
                ['B', 'C'],
                ['B', 'D'],
                ['C', 'D'],
            ];
            expect(result).toEqual(expected);
        });

        it('When selecting 1 object, Then it should return one combination per object', () => {
            // Given a list of distinct objects
            const items: string[] = ['A', 'B', 'C'];
            const subsetSize: number = 1;
            // When
            const result: string[][] = Sets.getSubset(items, subsetSize);
            // Then
            const expected: string[][] = [
                ['A'],
                ['B'],
                ['C'],
            ];
            expect(result).toEqual(expected);
        });

        it('When selecting all objects, Then it should return the original list as the only combination', () => {
            // Given a list of distinct objects
            const items: string[] = ['A', 'B', 'C'];
            const subsetSize: number = 3;
            // When
            const result: string[][] = Sets.getSubset(items, subsetSize);
            // Then
            const expected: string[][] = [
                ['A', 'B', 'C'],
            ];
            expect(result).toEqual(expected);
        });

        it('When selecting zero objects, Then it should return one empty combination', () => {
            // Given a list of distinct objects
            const items: string[] = ['A', 'B', 'C'];
            const subsetSize: number = 0;
            // When
            const result: string[][] = Sets.getSubset(items, subsetSize);
            // Then
            const expected: string[][] = [[]];
            expect(result).toEqual(expected);
        });

        it('When selecting more objects than available, Then it should return no Sets.getSubset', () => {
            // Given a list of distinct objects
            const items: string[] = ['A', 'B', 'C'];
            const subsetSize: number = 4;
            // When
            const result: string[][] = Sets.getSubset(items, subsetSize);
            // Then
            expect(result).toEqual([]);
        });

        it('When selecting a negative number of objects, Then it should return no Sets.getSubset', () => {
            // Given a list of distinct objects
            const items: string[] = ['A', 'B', 'C'];
            const subsetSize: number = -1;
            // When
            const result: string[][] = Sets.getSubset(items, subsetSize);
            // Then
            expect(result).toEqual([]);
        });

    });

    describe('Given an empty list', () => {

        it('When selecting zero objects, Then it should return one empty combination', () => {
            // Given
            const items: string[] = [];
            const subsetSize: number = 0;
            // When
            const result: string[][] = Sets.getSubset(items, subsetSize);
            // Then
            expect(result).toEqual([[]]);
        });

        it('When selecting one object, Then it should return no Sets.getSubset', () => {
            // Given
            const items: string[] = [];
            const subsetSize: number = 1;
            // When
            const result: string[][] = Sets.getSubset(items, subsetSize);
            // Then
            expect(result).toEqual([]);
        });

    });

    describe('Given typed objects', () => {

        interface TestObject {
            readonly id: number;
            readonly name: string;
        }

        it('When selecting a subset, Then it should preserve object identity and types', () => {
            // Given
            const objectA: TestObject = {
                id: 1,
                name: 'A',
            };
            const objectB: TestObject = {
                id: 2,
                name: 'B',
            };
            const objectC: TestObject = {
                id: 3,
                name: 'C',
            };
            const items: TestObject[] = [
                objectA,
                objectB,
                objectC,
            ];
            const subsetSize: number = 2;
            // When
            const result: TestObject[][] = Sets.getSubset(items, subsetSize);
            // Then
            expect(result.length).toBe(3);
            expect(result[0]).toEqual([objectA, objectB]);
            expect(result[1]).toEqual([objectA, objectC]);
            expect(result[2]).toEqual([objectB, objectC]);
            expect(result[0][0]).toBe(objectA);
            expect(result[0][1]).toBe(objectB);
        });

        it('When selecting all typed objects, Then it should return the same object references', () => {
            // Given
            const objectA: TestObject = {
                id: 1,
                name: 'A',
            };
            const objectB: TestObject = {
                id: 2,
                name: 'B',
            };
            const items: TestObject[] = [
                objectA,
                objectB,
            ];
            // When
            const result: TestObject[][] = Sets.getSubset(
                items,
                2,
            );
            // Then
            expect(result).toHaveSize(1);
            expect(result[0]).toEqual([objectA, objectB]);
            expect(result[0][0]).toBe(objectA);
            expect(result[0][1]).toBe(objectB);
        });

    });

    describe('Given five objects', () => {

        it('When selecting three objects, Then it should return exactly C(5,3) Sets.getSubset', () => {
            // Given
            const items: number[] = [1, 2, 3, 4, 5];
            const subsetSize: number = 3;
            // When
            const result: number[][] = Sets.getSubset(items, subsetSize);
            // Then
            expect(result.length).toBe(10);
        });

    });

});
