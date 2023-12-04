/* eslint-disable max-lines-per-function */
import { MGPOptional } from '../MGPOptional';
import { MGPSet } from '../MGPSet';
import { Pair } from './Pair.spec';

describe('MGPSet', () => {

    it('should create an empty set when not provided with argument', () => {
        const set: MGPSet<number> = new MGPSet<number>();
        expect(set.size()).toBe(0);
    });

    describe('equals', () => {

        it('should test size', () => {
            const one: MGPSet<string> = new MGPSet(['salut']);
            const two: MGPSet<string> = new MGPSet(['salut', 'kutentak']);
            expect(one.equals(two)).toBeFalse();
        });

        it('should not care about order', () => {
            const one: MGPSet<string> = new MGPSet(['un', 'deux']);
            const two: MGPSet<string> = new MGPSet(['deux', 'un']);
            expect(one.equals(two)).toBeTrue();
        });

        it('should detect inequality', () => {
            const one: MGPSet<string> = new MGPSet(['un', 'deux']);
            const two: MGPSet<string> = new MGPSet(['deux', 'trois']);
            expect(one.equals(two)).toBeFalse();
        });
    });

    describe('toString', () => {

        it('should show the set as a string', () => {
            const a: Pair = new Pair(0, 0);
            const b: Pair = new Pair(1, 1);
            const set: MGPSet<Pair> = new MGPSet([a, b]);
            expect(set.toString()).toBe('[' + a.toString() + ', ' + b.toString() + ']');
        });

        it('should show null when it is in the set', () => {
            const set: MGPSet<Pair | null> = new MGPSet([null]);
            expect(set.toString()).toBe('[null]');
        });
    });

    describe('add', () => {

        it('should return true when adding element', () => {
            const set: MGPSet<Pair> = new MGPSet([new Pair(0, 0), new Pair(1, 1)]);
            expect(set.add(new Pair(2, 2))).toBeTrue();
        });

        it('should not add duplicate elements, and return false instead', () => {
            const set: MGPSet<Pair> = new MGPSet([new Pair(0, 0), new Pair(1, 1)]);
            expect(set.add(new Pair(0, 0))).toBeFalse();
            expect(set.size()).toBe(2);
        });
    });

    describe('remove', () => {

        it('should remove element from the set and return true', () => {
            const set: MGPSet<number> = new MGPSet([1, 2]);
            expect(set.remove(2)).toBeTrue();
            expect(set.equals(new MGPSet([1]))).toBeTrue();
        });

        it('should preserve set and return false if element is not contained', () => {
            const set: MGPSet<number> = new MGPSet([1, 2]);
            expect(set.remove(3)).toBeFalse();
            expect(set.equals(new MGPSet([1, 2]))).toBeTrue();
        });
    });

    describe('union', () => {
        it('should return the elements present in either set', () => {
            const set: MGPSet<number> = new MGPSet([1, 2]);
            const otherSet: MGPSet<number> = new MGPSet([2, 3]);
            const union: MGPSet<number> = set.union(otherSet);
            expect(union).toEqual(new MGPSet([1, 2, 3]));
        });
    });

    describe('contains', () => {
        const set: MGPSet<number> = new MGPSet([1, 2]);
        it('should return true when the set contains the element', () => {
            expect(set.contains(1)).toBeTrue();
        });
        it('should return false when the set does not contain the element', () => {
            expect(set.contains(3)).toBeFalse();
        });
    });

    describe('size', () => {
        it('should return the size of the set', () => {
            const set: MGPSet<number> = new MGPSet([1, 2]);
            expect(set.size()).toBe(2);
        });
    });

    describe('toList', () => {

        it('should provide a copy of the set and disallow set modifications', () => {
            const originalData: Pair[] = [new Pair(0, 0), new Pair(1, 1)];
            const set: MGPSet<Pair> = new MGPSet(originalData);
            const assigned: MGPSet<Pair> = set;
            const copiedData: Pair[] = set.toList();

            assigned.add(new Pair(2, 2));

            expect(set.equals(assigned)).toBeTrue();
            expect(copiedData).toEqual(originalData);
        });
    });

    describe('getAnyElement', () => {

        it('should return an element from the set', () => {
            const set: MGPSet<number> = new MGPSet([1, 2]);
            const element: number = set.getAnyElement().get();
            expect(element === 1 || element === 2).toBeTrue();
        });

        it('should not return anything if the set is empty', () => {
            const emptySet: MGPSet<number> = new MGPSet();
            expect(emptySet.getAnyElement().isAbsent()).toBeTrue();
        });
    });

    describe('isEmpty', () => {

        it('should return true for the empty set', () => {
            const set: MGPSet<number> = new MGPSet();
            expect(set.isEmpty()).toBeTrue();
        });

        it('should return false for any non-empty set', () => {
            const set: MGPSet<number> = new MGPSet([1, 2]);
            expect(set.isEmpty()).toBeFalse();
        });
    });

    describe('hasElements', () => {

        it('should return false for the empty set', () => {
            const set: MGPSet<number> = new MGPSet();
            expect(set.hasElements()).toBeFalse();
        });

        it('should return true for any non-empty set', () => {
            const set: MGPSet<number> = new MGPSet([1, 2]);
            expect(set.hasElements()).toBeTrue();
        });
    });

    describe('map', () => {

        it('should iterate over the elements of the set', () => {
            const set: MGPSet<number> = new MGPSet([1, 2]);
            function increment(x: number): number {
                return x+1;
            }
            expect(set.map(increment).equals(new MGPSet([2, 3]))).toBeTrue();
       });
    });

    describe('flatMap', () => {

        it('should iterate over the elements of the set, and then flatten it again', () => {
            const set: MGPSet<number> = new MGPSet([1, 2]);
            function makeTwo(x: number): MGPSet<number> {
                return new MGPSet([x, x+1]);
            }
            expect(set.flatMap(makeTwo).equals(new MGPSet([1, 2, 3]))).toBeTrue();
        });
    });

    describe('filter', () => {
        it('should keep only elements for which the predicate returns true', () => {
            function pred(value: number): boolean {
                return value >= 2;
            }
            const set: MGPSet<number> = new MGPSet([1, 2]);
            expect(set.filter(pred)).toEqual(new MGPSet([2]));
        });
    });

    describe('findAnyCommonElement', () => {
        it('should return a common element if there is one', () => {
            const set: MGPSet<number> = new MGPSet([1, 2]);
            const otherSet: MGPSet<number> = new MGPSet([2, 3]);
            const commonElement: MGPOptional<number> = MGPOptional.of(2);
            expect(set.findAnyCommonElement(otherSet)).toEqual(commonElement);
        });
        it('should return empty if there is no common element', () => {
            const set: MGPSet<number> = new MGPSet([1, 2]);
            const otherSet: MGPSet<number> = new MGPSet([3, 4]);
            expect(set.findAnyCommonElement(otherSet)).toEqual(MGPOptional.empty());
        })
    });

    describe('intersection', () => {
        it('should return the elements present in both sets', () => {
            const set: MGPSet<number> = new MGPSet([1, 2]);
            const otherSet: MGPSet<number> = new MGPSet([2, 3]);
            const intersection: MGPSet<number> = set.intersection(otherSet);
            expect(intersection).toEqual(new MGPSet([2]));
        });
    });

    describe('iterator', () => {
        it('should iterate over all set values', () => {
            const set: MGPSet<number> = new MGPSet([1, 2, 3]);
            let sum: number = 0;
            for (const element of set) {
                sum += element;
            }
            expect(sum).toBe(6);
        });
    });

});
