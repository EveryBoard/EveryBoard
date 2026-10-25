/* eslint-disable max-len */
/* eslint-disable max-lines-per-function */

import { Set } from '@everyboard/lib';

import { Coord } from '../../Coord';
import { TriangularDirection } from '../../direction/TriangularDirection';
import { TriangularTopology } from '../TriangularTopology';

describe('TriangularTopology', () => {

    describe('getNextCoord', () => {

        const testCases: { start: Coord; distance: number; direction: TriangularDirection; expectedDestination: Coord }[] = [
            // Even coords:
            //     - left & up-left are the same at distance 1
            { start: new Coord(8, 8), distance: 1, direction: TriangularDirection.LEFT, expectedDestination: new Coord(7, 8) },
            { start: new Coord(8, 8), distance: 1, direction: TriangularDirection.UP_LEFT, expectedDestination: new Coord(7, 8) },
            //     - right & up-right are the same at distance 1
            { start: new Coord(8, 8), distance: 1, direction: TriangularDirection.RIGHT, expectedDestination: new Coord(9, 8) },
            { start: new Coord(8, 8), distance: 1, direction: TriangularDirection.UP_RIGHT, expectedDestination: new Coord(9, 8) },
            //     - down & down left are the same at distance 1
            { start: new Coord(8, 8), distance: 1, direction: TriangularDirection.DOWN_RIGHT, expectedDestination: new Coord(8, 9) },
            { start: new Coord(8, 8), distance: 1, direction: TriangularDirection.DOWN_LEFT, expectedDestination: new Coord(8, 9) },

            // Odd coords:
            //     - left & down-left are the same at distance 1
            { start: new Coord(7, 8), distance: 1, direction: TriangularDirection.LEFT, expectedDestination: new Coord(6, 8) },
            { start: new Coord(7, 8), distance: 1, direction: TriangularDirection.DOWN_LEFT, expectedDestination: new Coord(6, 8) },
            //     - up-left & up-right are the same at distance 1
            { start: new Coord(7, 8), distance: 1, direction: TriangularDirection.UP_LEFT, expectedDestination: new Coord(7, 7) },
            { start: new Coord(7, 8), distance: 1, direction: TriangularDirection.UP_RIGHT, expectedDestination: new Coord(7, 7) },
            //     - right & down-right are the same at distance one
            { start: new Coord(7, 8), distance: 1, direction: TriangularDirection.RIGHT, expectedDestination: new Coord(8, 8) },
            { start: new Coord(7, 8), distance: 1, direction: TriangularDirection.DOWN_RIGHT, expectedDestination: new Coord(8, 8) },

            // same with distance 2
            { start: new Coord(8, 8), distance: 2, direction: TriangularDirection.LEFT, expectedDestination: new Coord(6, 8) },
            { start: new Coord(8, 8), distance: 2, direction: TriangularDirection.UP_LEFT, expectedDestination: new Coord(7, 7) },
            { start: new Coord(8, 8), distance: 2, direction: TriangularDirection.RIGHT, expectedDestination: new Coord(10, 8) },
            { start: new Coord(8, 8), distance: 2, direction: TriangularDirection.UP_RIGHT, expectedDestination: new Coord(9, 7) },
            { start: new Coord(8, 8), distance: 2, direction: TriangularDirection.DOWN_RIGHT, expectedDestination: new Coord(9, 9) },
            { start: new Coord(8, 8), distance: 2, direction: TriangularDirection.DOWN_LEFT, expectedDestination: new Coord(7, 9) },
            { start: new Coord(7, 8), distance: 2, direction: TriangularDirection.LEFT, expectedDestination: new Coord(5, 8) },
            { start: new Coord(7, 8), distance: 2, direction: TriangularDirection.DOWN_LEFT, expectedDestination: new Coord(6, 9) },
            { start: new Coord(7, 8), distance: 2, direction: TriangularDirection.UP_LEFT, expectedDestination: new Coord(6, 7) },
            { start: new Coord(7, 8), distance: 2, direction: TriangularDirection.UP_RIGHT, expectedDestination: new Coord(8, 7) },
            { start: new Coord(7, 8), distance: 2, direction: TriangularDirection.RIGHT, expectedDestination: new Coord(9, 8) },
            { start: new Coord(7, 8), distance: 2, direction: TriangularDirection.DOWN_RIGHT, expectedDestination: new Coord(8, 9) },
        ];
        for (const testCase of testCases) {
            it(`${ testCase.start.toString() } + ${ testCase.direction.toString() } = ${ testCase.expectedDestination.toString() }`, () => {
                // Given callResult.start as our coord
                //       callResult.direction as our direction
                // and triangular topology
                const topology: TriangularTopology = new TriangularTopology();

                // When evaluating next coord
                const result: Coord = topology.getNextCoord(testCase.start, testCase.direction);

                // Then the result should be correct
                expect(result).toEqual(testCase.expectedDestination);
            });
        }
    });

    describe('getNeighbors', () => {

        it('should return all 3 neighboring coordinates (even coord)', () => {
            // Given triangular topology
            const topology: TriangularTopology = new TriangularTopology();
            const coord: Coord = new Coord(0, 1);

            // When evaluating neighbors
            const result: Set<Coord> = topology.getNeighbors(coord);

            // Then it should return the three neighbors
            expect(result.equals(
                new Set([
                    new Coord(-1, 1),
                    new Coord(1, 1),
                    new Coord(0, 0),
                ]),
            )).toBeTrue();
        });

        it('should return all 3 neighboring coordinates (odd coord)', () => {
            // Given triangular topology
            const topology: TriangularTopology = new TriangularTopology();
            const coord: Coord = new Coord(0, 0);

            // When evaluating neighbors
            const result: Set<Coord> = topology.getNeighbors(coord);

            // Then it should return the 3 neighbors
            expect(result.equals(
                new Set([
                    new Coord(-1, 0),
                    new Coord(1, 0),
                    new Coord(0, 1),
                ]),
            )).toBeTrue();
        });
    });
});
