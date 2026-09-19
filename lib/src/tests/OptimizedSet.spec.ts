/* eslint-disable max-lines-per-function */
import { OptimizedSet } from '../OptimizedSet';

import { Pair } from './Pair.spec';

class PairSet extends OptimizedSet<Pair> {
    protected override toFields(value: Pair): [number[], number] {
        return [[value.first], value.second];
    }
}

describe('OptimizedSet', () => {
    describe('creation', () => {

        it('should create empty set', () => {
            // When creating an empty set
            const set: PairSet = new PairSet();
            // Then it should be created with the right number of elements
            expect(set).toBeDefined();
            expect(set.size()).toBe(0);
        });

        it('should create unitary set', () => {
            // When creating a unitary set
            const set: PairSet = new PairSet([new Pair(1, 1)]);
            // Then it should be created with the right number of elements
            expect(set).toBeDefined();
            expect(set.size()).toBe(1);
        });

        it('should create unitary set with duplicate elements', () => {
            // When creating set with h duplicate elements
            const set: PairSet = new PairSet([new Pair(1, 1), new Pair(1, 1)]);
            // Then it should be created with the right number of elements
            expect(set).toBeDefined();
            expect(set.size()).toBe(1);
        });

        it('should create set with multiple elements', () => {
            // When creating a set with multiple elements
            const set: PairSet = new PairSet([new Pair(1, 1), new Pair(1, 2)]);
            // Then it should be created with the right number of elements
            expect(set).toBeDefined();
            expect(set.size()).toBe(2);
        });
    });

    describe('add', () => {
        it('should add new elements', () => {
            // Given a set
            const set: PairSet = new PairSet([new Pair(1, 1)]);
            expect(set.size()).toBe(1);
            // When adding an element to it
            const otherSet: PairSet = set.addElement(new Pair(1, 2));
            // Then the new element should be added
            expect(otherSet.size()).toBe(2);
        });
    });

    describe('contains', () => {
        it('should find elements in the set', () => {
            // Given a set with elements
            const set: PairSet = new PairSet([new Pair(1, 1), new Pair(1, 2)]);
            // When checking if it contains something
            // Then it should find the elements contained in the set
            expect(set.contains(new Pair(1, 1))).toBeTrue();
            expect(set.contains(new Pair(1, 2))).toBeTrue();
            expect(set.contains(new Pair(1, 3))).toBeFalse();
            expect(set.contains(new Pair(2, 1))).toBeFalse();
        });
    });

    describe('iterator', () => {
        it('should iterate over the set elements', () => {
            // Given a set with elements
            const set: PairSet = new PairSet([new Pair(1, 1), new Pair(1, 2)]);
            // When iterating over the elements
            // Then it should go over all elements
            const elementsSeen: Pair[] = [];
            for (const element of set) {
                elementsSeen.push(element);
            }
            expect(elementsSeen.length).toBe(2);
            expect(elementsSeen).toContain(new Pair(1, 1));
            expect(elementsSeen).toContain(new Pair(1, 2));
        });
    });
});
