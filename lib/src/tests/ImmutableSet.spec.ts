/* eslint-disable max-lines-per-function */
import { MGPOptional } from '../MGPOptional';
import { ImmutableSet } from '../ImmutableSet';
import { Pair } from './Pair.spec';

describe('ImmutableSet', () => {

    it('should create an empty set when not provided with argument', () => {
        const set: ImmutableSet<number> = new ImmutableSet<number>();
        expect(set.size()).toBe(0);
    });

    describe('equals', () => {

        it('should test size', () => {
            const one: ImmutableSet<string> = new ImmutableSet(['salut']);
            const two: ImmutableSet<string> = new ImmutableSet(['salut', 'kutentak']);
            expect(one.equals(two)).toBeFalse();
        });

        it('should not care about order', () => {
            const one: ImmutableSet<string> = new ImmutableSet(['un', 'deux']);
            const two: ImmutableSet<string> = new ImmutableSet(['deux', 'un']);
            expect(one.equals(two)).toBeTrue();
        });

        it('should detect inequality', () => {
            const one: ImmutableSet<string> = new ImmutableSet(['un', 'deux']);
            const two: ImmutableSet<string> = new ImmutableSet(['deux', 'trois']);
            expect(one.equals(two)).toBeFalse();
        });

    });

    describe('toString', () => {

        it('should show the set as a string', () => {
            const a: Pair = new Pair(0, 0);
            const b: Pair = new Pair(1, 1);
            const set: ImmutableSet<Pair> = new ImmutableSet([a, b]);
            expect(set.toString()).toBe('[' + a.toString() + ', ' + b.toString() + ']');
        });

        it('should show null when it is in the set', () => {
            const set: ImmutableSet<Pair | null> = new ImmutableSet([null]);
            expect(set.toString()).toBe('[null]');
        });

    });

    describe('union', () => {

        it('should return the elements present in either set', () => {
            const set: ImmutableSet<number> = new ImmutableSet([1, 2]);
            const otherSet: ImmutableSet<number> = new ImmutableSet([2, 3]);
            const union: ImmutableSet<number> = set.union(otherSet);
            expect(union).toEqual(new ImmutableSet([1, 2, 3]));
        });

    });

    describe('unionList', () => {

        it('should return the elements present in both the set and the list', () => {
            const set: ImmutableSet<number> = new ImmutableSet([1, 2]);
            const list: number[] = [2, 3];
            const union: ImmutableSet<number> = set.unionList(list);
            expect(union.equals(new ImmutableSet([1, 2, 3]))).toBeTrue();
        });

    });

    describe('unionElement', () => {

        it('should return the elements present in the set plus the new element', () => {
            const set: ImmutableSet<number> = new ImmutableSet([1, 2]);
            const union: ImmutableSet<number> = set.unionElement(3);
            expect(union.equals(new ImmutableSet([1, 2, 3]))).toBeTrue();
        });

    });

    describe('contains', () => {

        const set: ImmutableSet<number> = new ImmutableSet([1, 2]);

        it('should return true when the set contains the element', () => {
            expect(set.contains(1)).toBeTrue();
        });

        it('should return false when the set does not contain the element', () => {
            expect(set.contains(3)).toBeFalse();
        });

    });

    describe('size', () => {

        it('should return the size of the set', () => {
            const set: ImmutableSet<number> = new ImmutableSet([1, 2]);
            expect(set.size()).toBe(2);
        });

    });

    describe('toList', () => {

        it('should provide a copy of the set and disallow set modifications', () => {
            const originalData: Pair[] = [new Pair(0, 0), new Pair(1, 1)];
            const set: ImmutableSet<Pair> = new ImmutableSet(originalData);
            const copiedData: Pair[] = set.toList();

            copiedData.push(new Pair(2, 2));

            expect(set.equals(new ImmutableSet(originalData))).toBeTrue();
        });

    });

    describe('getAnyElement', () => {

        it('should return an element from the set', () => {
            const set: ImmutableSet<number> = new ImmutableSet([1, 2]);
            const element: number = set.getAnyElement().get();
            expect(element === 1 || element === 2).toBeTrue();
        });

        it('should not return anything if the set is empty', () => {
            const emptySet: ImmutableSet<number> = new ImmutableSet();
            expect(emptySet.getAnyElement().isAbsent()).toBeTrue();
        });

    });

    describe('isEmpty', () => {

        it('should return true for the empty set', () => {
            const set: ImmutableSet<number> = new ImmutableSet();
            expect(set.isEmpty()).toBeTrue();
        });

        it('should return false for any non-empty set', () => {
            const set: ImmutableSet<number> = new ImmutableSet([1, 2]);
            expect(set.isEmpty()).toBeFalse();
        });

    });

    describe('hasElements', () => {

        it('should return false for the empty set', () => {
            const set: ImmutableSet<number> = new ImmutableSet();
            expect(set.hasElements()).toBeFalse();
        });

        it('should return true for any non-empty set', () => {
            const set: ImmutableSet<number> = new ImmutableSet([1, 2]);
            expect(set.hasElements()).toBeTrue();
        });
    });

    describe('map', () => {

        it('should iterate over the elements of the set', () => {
            const set: ImmutableSet<number> = new ImmutableSet([1, 2]);
            function increment(x: number): number {
                return x+1;
            }
            expect(set.map(increment).equals(new ImmutableSet([2, 3]))).toBeTrue();
        });

    });

    describe('flatMap', () => {

        it('should iterate over the elements of the set, and then flatten it again', () => {
            const set: ImmutableSet<number> = new ImmutableSet([1, 2]);
            function makeTwo(x: number): ImmutableSet<number> {
                return new ImmutableSet([x, x+1]);
            }
            expect(set.flatMap(makeTwo).equals(new ImmutableSet([1, 2, 3]))).toBeTrue();
        });

    });

    describe('filter', () => {

        it('should keep only elements for which the predicate returns true', () => {
            function pred(value: number): boolean {
                return value >= 2;
            }
            const set: ImmutableSet<number> = new ImmutableSet([1, 2]);
            expect(set.filter(pred)).toEqual(new ImmutableSet([2]));
        });

    });

    describe('filterElement', () => {

        it('should keep all elements but the provided one', () => {
            const set: ImmutableSet<number> = new ImmutableSet([1, 2, 3]);
            const expected: ImmutableSet<number> = new ImmutableSet([1, 2]);
            expect(set.filterElement(3)).toEqual(expected);
        });

    });

    describe('findAnyCommonElement', () => {

        it('should return a common element if there is one', () => {
            const set: ImmutableSet<number> = new ImmutableSet([1, 2]);
            const otherSet: ImmutableSet<number> = new ImmutableSet([2, 3]);
            const commonElement: MGPOptional<number> = MGPOptional.of(2);
            expect(set.findAnyCommonElement(otherSet)).toEqual(commonElement);
        });

        it('should return empty if there is no common element', () => {
            const set: ImmutableSet<number> = new ImmutableSet([1, 2]);
            const otherSet: ImmutableSet<number> = new ImmutableSet([3, 4]);
            expect(set.findAnyCommonElement(otherSet)).toEqual(MGPOptional.empty());
        });

    });

    describe('intersection', () => {

        it('should return the elements present in both sets', () => {
            const set: ImmutableSet<number> = new ImmutableSet([1, 2]);
            const otherSet: ImmutableSet<number> = new ImmutableSet([2, 3]);
            const intersection: ImmutableSet<number> = set.intersection(otherSet);
            expect(intersection).toEqual(new ImmutableSet([2]));
        });

    });

    describe('iterator', () => {

        it('should iterate over all set values', () => {
            const set: ImmutableSet<number> = new ImmutableSet([1, 2, 3]);
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
            const fullSet: ImmutableSet<number> = new ImmutableSet([0]);
            const emptySet: ImmutableSet<number> = new ImmutableSet([]);

            // When calling getMissingElement on the empty one
            const missingElement: MGPOptional<number> = emptySet.getMissingElementFrom(fullSet);

            // Then it should return the missing element
            expect(missingElement).toEqual(MGPOptional.of(0));
        });

        it('should return a missing element between two sets that have an intersection', () => {
            // Given two set that have some intersection, but also an element not in common
            const fullSet: ImmutableSet<number> = new ImmutableSet([1, 2, 3]);
            const missingElementSet: ImmutableSet<number> = new ImmutableSet([1, 2]);

            // When calling getMissingElement on the one missing an element
            const missingElement: MGPOptional<number> = missingElementSet.getMissingElementFrom(fullSet);

            // Then it should return the missing element
            expect(missingElement).toEqual(MGPOptional.of(3));
        });

        it('should return empty when nothing is missing', () => {
            // Given two set, one with one element, the other empty
            const fullSet: ImmutableSet<number> = new ImmutableSet([0]);
            const emptySet: ImmutableSet<number> = new ImmutableSet([]);

            // When calling getMissingElement on the full one
            const missingElement: MGPOptional<number> = fullSet.getMissingElementFrom(emptySet);

            // Then it should appear than the full set miss nothing
            expect(missingElement).toEqual(MGPOptional.empty());
        });

    });

});
