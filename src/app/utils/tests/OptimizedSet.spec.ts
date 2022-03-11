/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { CoordSet } from '../OptimizedSet';

describe('OptimizedSet (CoordSet)', () => {
    it('should build the empty set if no value is provided', () => {
        const set: CoordSet = new CoordSet();
        expect(set.size()).toBe(0);
    });
    it('should build a set containing all provided values', () => {
        const set: CoordSet = new CoordSet([new Coord(1, 2), new Coord(2, 3)]);
        expect(set.contains(new Coord(1, 2))).toBeTrue();
        expect(set.contains(new Coord(2, 3))).toBeTrue();
        expect(set.size()).toBe(2);
    });
    it('should support iteration', () => {
        const set: CoordSet = new CoordSet([new Coord(2, 0), new Coord(1, 0)]);
        let elementsSeen: number = 0;
        let sumOfX: number = 0;
        for (const coord of set) {
            elementsSeen++;
            sumOfX += coord.x;
        }
        expect(elementsSeen).toBe(2);
        expect(sumOfX).toBe(3);
    });
    describe('add', () => {
        it('should add new elements to the set when no matching field has been seen', () => {
            const set: CoordSet = new CoordSet();
            expect(set.add(new Coord(1, 2))).toBeTrue();
            expect(set.size()).toBe(1);
        });
        it('should add new elements to the set even if a matching field has been seen', () => {
            const set: CoordSet = new CoordSet([new Coord(1, 2)]);
            // Coords fields are y first, then x
            expect(set.add(new Coord(2, 2))).toBeTrue();
            expect(set.size()).toBe(2);
        });
        it('should not add duplicate elements', () => {
            const set: CoordSet = new CoordSet([new Coord(1, 2)]);
            expect(set.add(new Coord(1, 2))).toBeFalse();
            expect(set.size()).toBe(1);
        });
    });
    describe('contains', () => {
        it('should detect when an element is in the set', () => {
            const set: CoordSet = new CoordSet([new Coord(1, 2)]);
            expect(set.contains(new Coord(1, 2))).toBeTrue();
        });
        it('should detect when an element is not in the set', () => {
            const set: CoordSet = new CoordSet([new Coord(1, 2)]);
            expect(set.contains(new Coord(2, 2))).toBeFalse();
            expect(set.contains(new Coord(1, 1))).toBeFalse();
        });
    });
});
