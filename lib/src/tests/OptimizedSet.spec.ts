/* eslint-disable max-lines-per-function */
import { MGPOptional } from '../MGPOptional';
import { OptimizedSet } from '../OptimizedSet';

import { Pair } from './Pair.spec';

class PairSet extends OptimizedSet<Pair> {
    protected override toFields(value: Pair): [number[], number] {
        return [[value.first], value.second];
    }

}

describe('OptimizedSet', () => {
    it('should create', () => {
        // When creating sets
        const emptySet: PairSet = new PairSet();
        const unitarySet: PairSet = new PairSet([new Pair(1, 1)]);
        const otherUnitarySet: PairSet = new PairSet([new Pair(1, 1), new Pair(1, 1)]);
        const multipleSet: PairSet = new PairSet([new Pair(1, 1), new Pair(1, 2)]);
        // Then they should all be created with the right elements
        expect(emptySet).toBeDefined();
        expect(emptySet.size()).toBe(0);
        expect(unitarySet).toBeDefined();
        expect(unitarySet.size()).toBe(1);
        expect(otherUnitarySet).toBeDefined();
        expect(otherUnitarySet.size()).toBe(1);
        expect(multipleSet).toBeDefined();
        expect(multipleSet.size()).toBe(2);
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
