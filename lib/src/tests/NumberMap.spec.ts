/* eslint-disable max-lines-per-function */
import { MGPOptional } from '../MGPOptional';
import { NumberMap } from '../NumberMap';

describe('NumberMap', () => {

    describe('add', () => {

        it('should add value to existing key and return old value', () => {
            // Given a map with a key
            const map: NumberMap<string> = new NumberMap();
            map.set('a', 3);

            // When adding to that key
            const result: MGPOptional<number> = map.add('a', 2);

            // Then the old value is returned and the map is updated
            expect(result).toEqual(MGPOptional.of(3));
            expect(map.get('a')).toEqual(MGPOptional.of(5));
        });

        it('should throw when key is absent', () => {
            // Given an empty map
            const map: NumberMap<string> = new NumberMap();

            // When adding to an absent key
            // Then it should throw
            expect(() => map.add('x', 1)).toThrowError('Assertion failure: NumberMap.add called on an invalid key: x');
        });

    });

    describe('addOrSet', () => {

        it('should accumulate value when key is already present', () => {
            // Given a map with a key
            const map: NumberMap<string> = new NumberMap();
            map.set('a', 10);

            // When calling addOrSet on that key
            const result: MGPOptional<number> = map.addOrSet('a', 5);

            // Then the old value is returned and the map is updated
            expect(result).toEqual(MGPOptional.of(10));
            expect(map.get('a')).toEqual(MGPOptional.of(15));
        });

        it('should set the value when key is absent', () => {
            // Given an empty map
            const map: NumberMap<string> = new NumberMap();

            // When calling addOrSet on an absent key
            const result: MGPOptional<number> = map.addOrSet('b', 7);

            // Then the value is inserted and the set value is returned
            expect(result).toEqual(MGPOptional.of(7));
            expect(map.get('b')).toEqual(MGPOptional.of(7));
        });

        it('should accumulate correctly across two calls', () => {
            // Given an empty map
            const map: NumberMap<string> = new NumberMap();

            // When calling addOrSet twice on the same key
            map.addOrSet('a', 3);
            map.addOrSet('a', 4);

            // Then values are summed
            expect(map.get('a')).toEqual(MGPOptional.of(7));
        });

    });

    describe('getCopy', () => {

        it('should return a NumberMap instance preserving add/addOrSet methods', () => {
            // Given a NumberMap with an entry
            const map: NumberMap<string> = new NumberMap();
            map.set('a', 1);

            // When copying it
            const copy: NumberMap<string> = map.getCopy();

            // Then the copy is a NumberMap and its methods work correctly
            expect(copy.get('a')).toEqual(MGPOptional.of(1));
            copy.addOrSet('a', 9);
            expect(copy.get('a')).toEqual(MGPOptional.of(10));
            expect(map.get('a')).toEqual(MGPOptional.of(1)); // original unchanged
        });

    });

});
