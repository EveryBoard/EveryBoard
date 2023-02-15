/* eslint-disable max-lines-per-function */
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
    it('should override equals correctly', () => {
        const coord: Coord = new Coord(0, 0);
        const horizontalNeighbors: Coord = new Coord(1, 0);
        const verticalNeighbors: Coord = new Coord(0, 1);
        expect(coord.equals(coord)).toBeTrue();
        expect(coord.equals(horizontalNeighbors)).toBeFalse();
        expect(coord.equals(verticalNeighbors)).toBeFalse();
    });
    it('should give correct coords between this and other coord', () => {
        const coord: Coord = new Coord(0, 0);
        const notAligned: Coord = new Coord(2, 1);
        const neighbors: Coord = new Coord(1, 1);
        const alignedFar: Coord = new Coord(2, 2);
        expect(coord.getCoordsToward(coord)).toEqual([]);
        expect(coord.getCoordsToward(notAligned)).toEqual([]);
        expect(coord.getCoordsToward(neighbors)).toEqual([]);
        expect(coord.getCoordsToward(alignedFar)).toEqual([new Coord(1, 1)]);
    });
    it('should throw when asked distance toward an unaligned coord', () => {
        const coord: Coord = new Coord(0, 0);
        const unalignedCoord: Coord = new Coord(1, 2);
        expect(() => coord.getDistance(unalignedCoord))
            .toThrowError('Cannot calculate distance with non aligned coords.');
    });
    it('should compute hexagonal alignments with isHexagonallyAlignedWith', () => {
        const coord: Coord = new Coord(1, 1);
        expect(coord.isHexagonallyAlignedWith(new Coord(0, 0))).toBeFalse();
        expect(coord.isHexagonallyAlignedWith(new Coord(0, 2))).toBeTrue();
        expect(coord.isHexagonallyAlignedWith(new Coord(1, 4))).toBeTrue();
        expect(coord.isHexagonallyAlignedWith(new Coord(5, 4))).toBeFalse();
    });
    describe('getDirectionToward', () => {
        it('should give direction', () => {
            const center: Coord = new Coord(0, 0);
            const lowRight: Coord = new Coord(2, 2);
            expect(center.getDirectionToward(lowRight).get()).toEqual(Direction.DOWN_RIGHT);
        });
        it('should fail when given invalid direction', () => {
            const center: Coord = new Coord(0, 0);
            const lowRight: Coord = new Coord(2, 4);
            expect(() => center.getDirectionToward(lowRight).get()).toThrow();
        });
    });
    describe('getUntil', () => {
        it('should include all coord between A and B, A and B excluded', () => {
            // Given a coord B that is 3 steps after A
            const A: Coord = new Coord(0, 0);
            const B: Coord = new Coord(3, 0);

            // When getting all coord from A until B
            const coords: Coord[] = A.getUntil(B);

            // Then the list should have 2 elements, including B and not A
            expect(coords.length).toBe(2);
            const AIncluded: boolean = coords.some((c: Coord) => c.equals(A));
            expect(AIncluded).toBeFalse();
            const BIncluded: boolean = coords.some((c: Coord) => c.equals(B));
            expect(BIncluded).toBeFalse();
        });
    });
});
