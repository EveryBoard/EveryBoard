/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { MGPSet } from '../MGPSet';

describe('MGPSet', () => {

    it('should create an empty set when not provided with argument', () => {
        const set: MGPSet<number> = new MGPSet<number>();
        expect(set.size()).toBe(0);
    });
    describe('equals', () => {
        it('Should test size', () => {
            const one: MGPSet<string> = new MGPSet(['salut']);
            const two: MGPSet<string> = new MGPSet(['salut', 'kutentak']);
            expect(one.equals(two)).toBeFalse();
        });
        it('Should not care about order', () => {
            const one: MGPSet<string> = new MGPSet(['un', 'deux']);
            const two: MGPSet<string> = new MGPSet(['deux', 'un']);
            expect(one.equals(two)).toBeTrue();
        });
        it('Should detect inequality', () => {
            const one: MGPSet<string> = new MGPSet(['un', 'deux']);
            const two: MGPSet<string> = new MGPSet(['deux', 'trois']);
            expect(one.equals(two)).toBeFalse();
        });
    });
    describe('toString', () => {
        it('should work as expected', () => {
            const a: Coord = new Coord(0, 0);
            const b: Coord = new Coord(1, 1);
            const set: MGPSet<Coord> = new MGPSet([a, b]);
            expect(set.toString()).toBe('[' + a.toString() + ', ' + b.toString() + ']');
        });
        it('should support null', () => {
            const set: MGPSet<Coord | null> = new MGPSet([null]);
            expect(set.toString()).toBe('[null]');
        });
    });
    describe('toList', () => {
        it('should provide a copy of the set and disallow set modifications', () => {
            const originalData: Coord[] = [new Coord(0, 0), new Coord(1, 1)];
            const set: MGPSet<Coord> = new MGPSet(originalData);
            const assigned: MGPSet<Coord> = set;
            const copiedData: Coord[] = set.toList();

            assigned.add(new Coord(2, 2));

            expect(set.equals(assigned)).toBeTrue();
            expect(copiedData).toEqual(originalData);
        });
    });
    describe('add', () => {
        it('should not add duplicate elements, and return false instead', () => {
            const set: MGPSet<Coord> = new MGPSet([new Coord(0, 0), new Coord(1, 1)]);
            expect(set.add(new Coord(2, 2))).toBeTrue();
            expect(set.add(new Coord(0, 0))).toBeFalse();
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
});
