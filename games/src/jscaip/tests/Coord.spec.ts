/* eslint-disable max-lines-per-function */
import { TestUtils } from '@everyboard/lib/testing';

import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Ordinal } from '../Ordinal';

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

    describe('getCoordsToward', () => {

        it('should throw when start and end are not aligned', () => {
            // Given two unaligned coords
            const coord: Coord = new Coord(0, 0);
            const notAligned: Coord = new Coord(2, 1);

            // When calculating the coords from coord to notAligned
            // Then it should throw
            const reason: string = 'Should only call getCoordsToward on aligned coords';
            TestUtils.expectToThrowAndLog(() => {
                coord.getCoordsToward(notAligned);
            }, reason);
        });

        it('should give correct coords between this and other aligned coord', () => {
            const coord: Coord = new Coord(0, 0);
            const neighbors: Coord = new Coord(1, 1);
            const alignedFar: Coord = new Coord(2, 2);
            expect(coord.getCoordsToward(coord)).toEqual([]);
            expect(coord.getCoordsToward(neighbors)).toEqual([]);
            expect(coord.getCoordsToward(alignedFar)).toEqual([new Coord(1, 1)]);
        });

    });

    it('should throw when asked distance toward an unaligned coord', () => {
        const coord: Coord = new Coord(0, 0);
        const unalignedCoord: Coord = new Coord(1, 2);
        expect(() => coord.getLinearDistanceToward(unalignedCoord))
            .toThrowError('Assertion failure: Cannot calculate distance with non aligned coords.');
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
            expect(center.getDirectionToward(lowRight).get()).toEqual(Ordinal.DOWN_RIGHT);
        });

        it('should fail when given invalid direction', () => {
            const center: Coord = new Coord(0, 0);
            const lowRight: Coord = new Coord(2, 4);
            expect(() => center.getDirectionToward(lowRight).get()).toThrow();
        });

    });

    describe('getAllCoordsToward', () => {

        it('should return only current coord when coord and end are identical', () => {
            // Given any coord
            const coord: Coord = new Coord(0, 0);

            // When calling getAllCoordsToward with another coord identical
            const allCoordsToward: Coord[] = coord.getAllCoordsToward(new Coord(0, 0));

            // Then the resulting list should only have coord
            expect(allCoordsToward).toEqual([coord]);
        });

        it('should return only coord and end when coord and end are neighbor', () => {
            // Given any coord
            const coord: Coord = new Coord(0, 0);

            // When calling getAllCoordsToward with another neighbooring coord
            const neighbor: Coord = new Coord(1, 1);
            const allCoordsToward: Coord[] = coord.getAllCoordsToward(neighbor);

            // Then the resulting list should only the two coord
            expect(allCoordsToward).toEqual([coord, neighbor]);
        });

        it('should return all element of the traject when start and end are far', () => {
            // Given any coord
            const coord: Coord = new Coord(0, 0);

            // When calling getAllCoordsToward with a far away aligned coord
            const farAwayAlignedCoord: Coord = new Coord(2, 2);
            const allCoordsToward: Coord[] = coord.getAllCoordsToward(farAwayAlignedCoord);

            // Then the resulting list should only the two coord
            expect(allCoordsToward).toEqual([coord, new Coord(1, 1), farAwayAlignedCoord]);
        });

        it('should throw and log when coords are not aligned', () => {
            // Given two coord not aligned
            const start: Coord = new Coord(0, 0);
            const end: Coord = new Coord(1, 2);

            // When getting all coord toward end
            // Then it should throw
            const reason: string = 'Should only call getCoordsToward on aligned coords';
            TestUtils.expectToThrowAndLog(() => {
                start.getAllCoordsToward(end);
            }, reason);
        });

    });

    describe('getDistanceToward', () => {

        const coord: Coord = new Coord(0, 0);

        it('should calculate result and not check alignment', () => {
            const distance: number = coord.getDistanceToward(new Coord(1, 1), false);
            expect(distance).toBe(1);
        });

        it('should calculate result for "knight-like" distance without checking alignment', () => {
            const distance: number = coord.getDistanceToward(new Coord(1, 2), false);
            expect(distance).toBe(2);
        });

        it('should throw when checkAlignment = true and provided coord is not aligned', () => {
            TestUtils.expectToThrowAndLog(
                () => coord.getDistanceToward(new Coord(1, 2), true),
                'Cannot calculate distance with non aligned coords.',
            );
        });

    });

    describe('getNextToric', () => {
        type CoordPlusDirectionPlusStep = {
            title: string;
            coord: Coord;
            direction: Direction;
            step: number;
            result: Coord;
        };
        const coordPlusDirectionPlusSteps: CoordPlusDirectionPlusStep[] = [
            { title: 'should go back left when going too much right                         : ', coord: new Coord(7, 4), step: 1, result: new Coord(0, 4), direction: Ordinal.RIGHT },
            { title: 'should go back right when going too much left                         : ', coord: new Coord(0, 4), step: 1, result: new Coord(7, 4), direction: Ordinal.LEFT },
            { title: 'should go back top when going too much bottom                         : ', coord: new Coord(4, 7), step: 1, result: new Coord(4, 0), direction: Ordinal.DOWN },
            { title: 'should go back bottom when going too much top                         : ', coord: new Coord(4, 0), step: 1, result: new Coord(4, 7), direction: Ordinal.UP },
            { title: 'should go to other corner when diagonalign from corner                : ', coord: new Coord(0, 0), step: 1, result: new Coord(7, 7), direction: Ordinal.UP_LEFT },
            { title: 'should go to other side when diagonligh from left border              : ', coord: new Coord(7, 4), step: 1, result: new Coord(0, 5), direction: Ordinal.DOWN_RIGHT },
            { title: 'should go back left when going too much right (double step)           : ', coord: new Coord(7, 4), step: 2, result: new Coord(1, 4), direction: Ordinal.RIGHT },
            { title: 'should go back right when going too much left (double step)           : ', coord: new Coord(0, 4), step: 2, result: new Coord(6, 4), direction: Ordinal.LEFT },
            { title: 'should go back top when going too much bottom (double step)           : ', coord: new Coord(4, 7), step: 2, result: new Coord(4, 1), direction: Ordinal.DOWN },
            { title: 'should go back bottom when going too much top (double step)           : ', coord: new Coord(4, 0), step: 2, result: new Coord(4, 6), direction: Ordinal.UP },
            { title: 'should go to other corner when diagonalign from corner (double step)  : ', coord: new Coord(0, 0), step: 2, result: new Coord(6, 6), direction: Ordinal.UP_LEFT },
            { title: 'should go to other side when diagonligh from left border (double step): ', coord: new Coord(7, 4), step: 2, result: new Coord(1, 6), direction: Ordinal.DOWN_RIGHT },
        ];
        for (const coordPlusDirectionPlusStep of coordPlusDirectionPlusSteps) {
            it(coordPlusDirectionPlusStep.title, () => {
                // Given coord, step and direction
                const coord: Coord = coordPlusDirectionPlusStep.coord;
                const step: number = coordPlusDirectionPlusStep.step;
                const direction: Direction = coordPlusDirectionPlusStep.direction;

                // When calling getNextToric
                const nextCoord: Coord = coord.getNextToric(direction, 8, 8, step);

                // Then appropriate result is expected
                expect(nextCoord).toEqual(coordPlusDirectionPlusStep.result);
            });
        }

    });

});
