import { Coord } from 'src/app/jscaip/Coord';
import { MGPSet } from '../MGPSet';

describe('MGPSet', () => {

    it('should create an empty list when not provided with argument', () => {
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
        it('Should spot inegality', () => {
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
    it('while non-copy assignation would modify the original, copy dont', () => {
        const originalData: Coord[] = [new Coord(0, 0), new Coord(1, 1)];
        const set: MGPSet<Coord> = new MGPSet(originalData);
        const assigned: MGPSet<Coord> = set;
        const copiedData: Coord[] = set.getCopy();

        assigned.add(new Coord(2, 2));

        expect(set.equals(assigned)).toBeTrue();
        expect(copiedData).toEqual(originalData);
    });
    it('should not add duplicates, and say so', () => {
        const set: MGPSet<Coord> = new MGPSet([new Coord(0, 0), new Coord(1, 1)]);
        expect(set.add(new Coord(2, 2))).toBeTrue();
        expect(set.add(new Coord(0, 0))).toBeFalse();
    });
    it('get should return element, as it is (hence, this is not really an immutable set)', () => {
        const set: MGPSet<Coord> = new MGPSet([new Coord(0, 0), new Coord(1, 1)]);
        expect(set.get(0)).toEqual(new Coord(0, 0));
    });
    describe('removeAndCopy', () => {
        it('should remove the element from the set', () => {
            const set: MGPSet<number> = new MGPSet([1, 2]);
            const withoutElement: MGPSet<number> = set.removeAndCopy(2);
            expect(withoutElement.contains(2)).toBeFalse();
        });
        it('should not modify the initial set', () => {
            const set: MGPSet<number> = new MGPSet([1, 2]);
            set.removeAndCopy(2);
            expect(set.contains(2)).toBeTrue();
        });
    });
});
