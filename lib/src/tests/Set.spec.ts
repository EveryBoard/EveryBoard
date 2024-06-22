/* eslint-disable max-lines-per-function */
import { MGPOptional } from '../MGPOptional';
import { Set } from '../Set';
import { Pair } from './Pair.spec';

describe('Set', () => {

    it('should create an empty set when not provided with argument', () => {
        const set: Set<number> = new Set<number>();
        expect(set.size()).toBe(0);
    });

    describe('equals', () => {

        it('should test size', () => {
            const one: Set<string> = new Set(['salut']);
            const two: Set<string> = new Set(['salut', 'kutentak']);
            expect(one.equals(two)).toBeFalse();
        });

        it('should not care about order', () => {
            const one: Set<string> = new Set(['un', 'deux']);
            const two: Set<string> = new Set(['deux', 'un']);
            expect(one.equals(two)).toBeTrue();
        });

        it('should detect inequality', () => {
            const one: Set<string> = new Set(['un', 'deux']);
            const two: Set<string> = new Set(['deux', 'trois']);
            expect(one.equals(two)).toBeFalse();
        });

    });

    describe('toString', () => {

        it('should show the set as a string', () => {
            const a: Pair = new Pair(0, 0);
            const b: Pair = new Pair(1, 1);
            const set: Set<Pair> = new Set([a, b]);
            expect(set.toString()).toBe('[' + a.toString() + ', ' + b.toString() + ']');
        });

        it('should show null when it is in the set', () => {
            const set: Set<Pair | null> = new Set([null]);
            expect(set.toString()).toBe('[null]');
        });

    });

    describe('union', () => {

        it('should return the elements present in either set', () => {
            const set: Set<number> = new Set([1, 2]);
            const otherSet: Set<number> = new Set([2, 3]);
            const union: Set<number> = set.union(otherSet);
            expect(union.equals(new Set([1, 2, 3]))).toBeTrue();
        });

    });

    describe('unionList', () => {

        it('should return the elements present in both the set and the list', () => {
            const set: Set<number> = new Set([1, 2]);
            const list: number[] = [2, 3];
            const union: Set<number> = set.unionList(list);
            expect(union.equals(new Set([1, 2, 3]))).toBeTrue();
        });

    });

    describe('addElement', () => {

        it('should return the elements present in the set plus the new element', () => {
            const set: Set<number> = new Set([1, 2]);
            const union: Set<number> = set.addElement(3);
            expect(union.equals(new Set([1, 2, 3]))).toBeTrue();
        });

    });

    describe('contains', () => {

        const set: Set<number> = new Set([1, 2]);

        it('should return true when the set contains the element', () => {
            expect(set.contains(1)).toBeTrue();
        });

        it('should return false when the set does not contain the element', () => {
            expect(set.contains(3)).toBeFalse();
        });

    });

    describe('size', () => {

        it('should return the size of the set', () => {
            const set: Set<number> = new Set([1, 2]);
            expect(set.size()).toBe(2);
        });

    });

    describe('toList', () => {

        it('should provide a copy of the set and disallow set modifications', () => {
            const originalData: Pair[] = [new Pair(0, 0), new Pair(1, 1)];
            const set: Set<Pair> = new Set(originalData);
            const copiedData: Pair[] = set.toList();

            copiedData.push(new Pair(2, 2));

            expect(set.equals(new Set(originalData))).toBeTrue();
        });

    });

    describe('getAnyElement', () => {

        it('should return an element from the set', () => {
            const set: Set<number> = new Set([1, 2]);
            const element: number = set.getAnyElement().get();
            expect(element === 1 || element === 2).toBeTrue();
        });

        it('should not return anything if the set is empty', () => {
            const emptySet: Set<number> = new Set();
            expect(emptySet.getAnyElement().isAbsent()).toBeTrue();
        });

    });

    describe('isEmpty', () => {

        it('should return true for the empty set', () => {
            const set: Set<number> = new Set();
            expect(set.isEmpty()).toBeTrue();
        });

        it('should return false for any non-empty set', () => {
            const set: Set<number> = new Set([1, 2]);
            expect(set.isEmpty()).toBeFalse();
        });

    });

    describe('hasElements', () => {

        it('should return false for the empty set', () => {
            const set: Set<number> = new Set();
            expect(set.hasElements()).toBeFalse();
        });

        it('should return true for any non-empty set', () => {
            const set: Set<number> = new Set([1, 2]);
            expect(set.hasElements()).toBeTrue();
        });
    });

    describe('map', () => {

        it('should iterate over the elements of the set', () => {
            const set: Set<number> = new Set([1, 2]);
            function increment(x: number): number {
                return x+1;
            }
            expect(set.map(increment).equals(new Set([2, 3]))).toBeTrue();
        });

    });

    describe('flatMap', () => {

        it('should iterate over the elements of the set, and then flatten it again', () => {
            const set: Set<number> = new Set([1, 2]);
            function makeTwo(x: number): Set<number> {
                return new Set([x, x+1]);
            }
            expect(set.flatMap(makeTwo).equals(new Set([1, 2, 3]))).toBeTrue();
        });

    });

    describe('filter', () => {

        it('should keep only elements for which the predicate returns true', () => {
            function pred(value: number): boolean {
                return value >= 2;
            }
            const set: Set<number> = new Set([1, 2]);
            expect(set.filter(pred).equals(new Set([2]))).toBeTrue();
        });

    });

    describe('removeElement', () => {

        it('should keep all elements but the provided one', () => {
            const set: Set<number> = new Set([1, 2, 3]);
            const expected: Set<number> = new Set([1, 2]);
            expect(set.removeElement(3).equals(expected)).toBeTrue();
        });

    });

    describe('findAnyCommonElement', () => {

        it('should return a common element if there is one', () => {
            const set: Set<number> = new Set([1, 2]);
            const otherSet: Set<number> = new Set([2, 3]);
            const commonElement: MGPOptional<number> = MGPOptional.of(2);
            expect(set.findAnyCommonElement(otherSet)).toEqual(commonElement);
        });

        it('should return empty if there is no common element', () => {
            const set: Set<number> = new Set([1, 2]);
            const otherSet: Set<number> = new Set([3, 4]);
            expect(set.findAnyCommonElement(otherSet)).toEqual(MGPOptional.empty());
        });

    });

    describe('intersection', () => {

        it('should return the elements present in both sets', () => {
            const set: Set<number> = new Set([1, 2]);
            const otherSet: Set<number> = new Set([2, 3]);
            const intersection: Set<number> = set.intersection(otherSet);
            expect(intersection.equals(new Set([2]))).toBeTrue();
        });

    });

    describe('iterator', () => {

        it('should iterate over all set values', () => {
            const set: Set<number> = new Set([1, 2, 3]);
            let sum: number = 0;
            for (const element of set) {
                sum += element;
            }
            expect(sum).toBe(6);
        });

    });

    describe('getMissingElement', () => {

        it('should return a missing element between two sets that have no intersection', () => {
            // Given two set, one with one element, the other empty
            const fullSet: Set<number> = new Set([0]);
            const emptySet: Set<number> = new Set([]);

            // When calling getMissingElement on the empty one
            const missingElement: MGPOptional<number> = emptySet.getMissingElementFrom(fullSet);

            // Then it should return the missing element
            expect(missingElement).toEqual(MGPOptional.of(0));
        });

        it('should return a missing element between two sets that have an intersection', () => {
            // Given two set that have some intersection, but also an element not in common
            const fullSet: Set<number> = new Set([1, 2, 3]);
            const missingElementSet: Set<number> = new Set([1, 2]);

            // When calling getMissingElement on the one missing an element
            const missingElement: MGPOptional<number> = missingElementSet.getMissingElementFrom(fullSet);

            // Then it should return the missing element
            expect(missingElement).toEqual(MGPOptional.of(3));
        });

        it('should return empty when nothing is missing', () => {
            // Given two set, one with one element, the other empty
            const fullSet: Set<number> = new Set([0]);
            const emptySet: Set<number> = new Set([]);

            // When calling getMissingElement on the full one
            const missingElement: MGPOptional<number> = fullSet.getMissingElementFrom(emptySet);

            // Then it should appear than the full set miss nothing
            expect(missingElement).toEqual(MGPOptional.empty());
        });

    });

});
