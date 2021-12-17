import { Coord } from '../Coord';
import { Direction } from '../Direction';

describe('Coord', () => {

    it('should compare correctly, y first', () => {
        const smallCoord: Coord = new Coord(2, 1);
        const bigCoord: Coord = new Coord(1, 2);
        expect(smallCoord.compareTo(bigCoord)).toBe(-1);
        expect(smallCoord.compareTo(smallCoord)).toBe(0);
    });
    it('should compare correctly obvious case', () => {
        const smallCoord: Coord = new Coord(0, 0);
        const bigCoord: Coord = new Coord(2, 2);
        expect(smallCoord.compareTo(bigCoord)).toBe(-1);
    });
    it('should know wether A is between B and C', () => {
        const upLeft: Coord = new Coord(1, 1);
        const middle: Coord = new Coord(3, 3);
        const downRight: Coord = new Coord(9, 9);
        expect(middle.isBetween(upLeft, downRight)).toBeTrue();
    });
    it('Should override equals correctly', () => {
        const coord: Coord = new Coord(0, 0);
        const horizontalNeighboors: Coord = new Coord(1, 0);
        const verticalNeighboors: Coord = new Coord(0, 1);
        expect(coord.equals(coord)).toBeTrue();
        expect(coord.equals(horizontalNeighboors)).toBeFalse();
        expect(coord.equals(verticalNeighboors)).toBeFalse();
    });
    it('Should vectorise correctly', () => {
        const c: Coord = new Coord(3, -11);
        expect(c.toVector()).toEqual(c);

        const c0: Coord = new Coord(4, -8);
        expect(c0.toVector()).toEqual(new Coord(1, -2));

        const c1: Coord = new Coord(-3, -9);
        expect(c1.toVector()).toEqual(new Coord(-1, -3));
    });
    it('Should give correct coords between this and other coord', () => {
        const coord: Coord = new Coord(0, 0);
        const notAligned: Coord = new Coord(2, 1);
        const neighboors: Coord = new Coord(1, 1);
        const alignedFar: Coord = new Coord(2, 2);
        expect(coord.getCoordsToward(coord)).toEqual([]);
        expect(coord.getCoordsToward(notAligned)).toEqual([]);
        expect(coord.getCoordsToward(neighboors)).toEqual([]);
        expect(coord.getCoordsToward(alignedFar)).toEqual([new Coord(1, 1)]);
    });
    it('Should throw when asked distance toward an unaligned coord', () => {
        const coord: Coord = new Coord(0, 0);
        const unalignedCoord: Coord = new Coord(1, 2);
        expect(() => coord.getDistance(unalignedCoord))
            .toThrowError('Cannot calculate distance with non aligned coords.');
    });
    describe('getDirectionToward', () => {
        it('Should give direction', () => {
            const center: Coord = new Coord(0, 0);
            const lowRight: Coord = new Coord(2, 2);
            expect(center.getDirectionToward(lowRight).get()).toEqual(Direction.DOWN_RIGHT);
        });
        it('Should fail when given invalid direction', () => {
            const center: Coord = new Coord(0, 0);
            const lowRight: Coord = new Coord(2, 4);
            expect(() => center.getDirectionToward(lowRight).get()).toThrow();
        });
    });
});
