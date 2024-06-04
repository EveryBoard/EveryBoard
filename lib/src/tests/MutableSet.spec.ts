/* eslint-disable max-lines-per-function */
import { MGPOptional } from '../MGPOptional';
import { MutableSet } from '../MutableSet';
import { Pair } from './Pair.spec';

describe('MutableSet', () => {

    it('should create an empty set when not provided with argument', () => {
        const set: MutableSet<number> = new MutableSet<number>();
        expect(set.size()).toBe(0);
    });

    describe('equals', () => {

        it('should test size', () => {
            const one: MutableSet<string> = new MutableSet(['salut']);
            const two: MutableSet<string> = new MutableSet(['salut', 'kutentak']);
            expect(one.equals(two)).toBeFalse();
        });

        it('should not care about order', () => {
            const one: MutableSet<string> = new MutableSet(['un', 'deux']);
            const two: MutableSet<string> = new MutableSet(['deux', 'un']);
            expect(one.equals(two)).toBeTrue();
        });

        it('should detect inequality', () => {
            const one: MutableSet<string> = new MutableSet(['un', 'deux']);
            const two: MutableSet<string> = new MutableSet(['deux', 'trois']);
            expect(one.equals(two)).toBeFalse();
        });

    });

    describe('toString', () => {

        it('should show the set as a string', () => {
            const a: Pair = new Pair(0, 0);
            const b: Pair = new Pair(1, 1);
            const set: MutableSet<Pair> = new MutableSet([a, b]);
            expect(set.toString()).toBe('[' + a.toString() + ', ' + b.toString() + ']');
        });

        it('should show null when it is in the set', () => {
            const set: MutableSet<Pair | null> = new MutableSet([null]);
            expect(set.toString()).toBe('[null]');
        });

    });

    describe('add', () => {

        it('should return true when adding element', () => {
            const set: MutableSet<Pair> = new MutableSet([new Pair(0, 0), new Pair(1, 1)]);
            expect(set.add(new Pair(2, 2))).toBeTrue();
        });

        it('should not add duplicate elements, and return false instead', () => {
            const set: MutableSet<Pair> = new MutableSet([new Pair(0, 0), new Pair(1, 1)]);
            expect(set.add(new Pair(0, 0))).toBeFalse();
            expect(set.size()).toBe(2);
        });

    });

    describe('remove', () => {

        it('should remove element from the set and return true', () => {
            const set: MutableSet<number> = new MutableSet([1, 2]);
            expect(set.remove(2)).toBeTrue();
            expect(set.equals(new MutableSet([1]))).toBeTrue();
        });

        it('should preserve set and return false if element is not contained', () => {
            const set: MutableSet<number> = new MutableSet([1, 2]);
            expect(set.remove(3)).toBeFalse();
            expect(set.equals(new MutableSet([1, 2]))).toBeTrue();
        });

    });

    describe('contains', () => {

        const set: MutableSet<number> = new MutableSet([1, 2]);

        it('should return true when the set contains the element', () => {
            expect(set.contains(1)).toBeTrue();
        });

        it('should return false when the set does not contain the element', () => {
            expect(set.contains(3)).toBeFalse();
        });

    });

    describe('size', () => {

        it('should return the size of the set', () => {
            const set: MutableSet<number> = new MutableSet([1, 2]);
            expect(set.size()).toBe(2);
        });

    });

    describe('toList', () => {

        it('should provide a copy of the set and disallow set modifications', () => {
            const originalData: Pair[] = [new Pair(0, 0), new Pair(1, 1)];
            const set: MutableSet<Pair> = new MutableSet(originalData);
            const assigned: MutableSet<Pair> = set;
            const copiedData: Pair[] = set.toList();

            assigned.add(new Pair(2, 2));

            expect(set.equals(assigned)).toBeTrue();
            expect(copiedData).toEqual(originalData);
        });

    });

    describe('getAnyElement', () => {

        it('should return an element from the set', () => {
            const set: MutableSet<number> = new MutableSet([1, 2]);
            const element: number = set.getAnyElement().get();
            expect(element === 1 || element === 2).toBeTrue();
        });

        it('should not return anything if the set is empty', () => {
            const emptySet: MutableSet<number> = new MutableSet();
            expect(emptySet.getAnyElement().isAbsent()).toBeTrue();
        });

    });

    describe('isEmpty', () => {

        it('should return true for the empty set', () => {
            const set: MutableSet<number> = new MutableSet();
            expect(set.isEmpty()).toBeTrue();
        });

        it('should return false for any non-empty set', () => {
            const set: MutableSet<number> = new MutableSet([1, 2]);
            expect(set.isEmpty()).toBeFalse();
        });

    });

    describe('hasElements', () => {

        it('should return false for the empty set', () => {
            const set: MutableSet<number> = new MutableSet();
            expect(set.hasElements()).toBeFalse();
        });

        it('should return true for any non-empty set', () => {
            const set: MutableSet<number> = new MutableSet([1, 2]);
            expect(set.hasElements()).toBeTrue();
        });
    });

    describe('findAnyCommonElement', () => {

        it('should return a common element if there is one', () => {
            const set: MutableSet<number> = new MutableSet([1, 2]);
            const otherSet: MutableSet<number> = new MutableSet([2, 3]);
            const commonElement: MGPOptional<number> = MGPOptional.of(2);
            expect(set.findAnyCommonElement(otherSet)).toEqual(commonElement);
        });

        it('should return empty if there is no common element', () => {
            const set: MutableSet<number> = new MutableSet([1, 2]);
            const otherSet: MutableSet<number> = new MutableSet([3, 4]);
            expect(set.findAnyCommonElement(otherSet)).toEqual(MGPOptional.empty());
        });

    });

    describe('iterator', () => {

        it('should iterate over all set values', () => {
            const set: MutableSet<number> = new MutableSet([1, 2, 3]);
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
            const fullSet: MutableSet<number> = new MutableSet([0]);
            const emptySet: MutableSet<number> = new MutableSet([]);

            // When calling getMissingElement on the empty one
            const missingElement: MGPOptional<number> = emptySet.getMissingElementFrom(fullSet);

            // Then it should return the missing element
            expect(missingElement).toEqual(MGPOptional.of(0));
        });

        it('should return a missing element between two sets that have an intersection', () => {
            // Given two set that have some intersection, but also an element not in common
            const fullSet: MutableSet<number> = new MutableSet([1, 2, 3]);
            const missingElementSet: MutableSet<number> = new MutableSet([1, 2]);

            // When calling getMissingElement on the one missing an element
            const missingElement: MGPOptional<number> = missingElementSet.getMissingElementFrom(fullSet);

            // Then it should return the missing element
            expect(missingElement).toEqual(MGPOptional.of(3));
        });

        it('should return empty when nothing is missing', () => {
            // Given two set, one with one element, the other empty
            const fullSet: MutableSet<number> = new MutableSet([0]);
            const emptySet: MutableSet<number> = new MutableSet([]);

            // When calling getMissingElement on the full one
            const missingElement: MGPOptional<number> = fullSet.getMissingElementFrom(emptySet);

            // Then it should appear than the full set miss nothing
            expect(missingElement).toEqual(MGPOptional.empty());
        });

    });

});
