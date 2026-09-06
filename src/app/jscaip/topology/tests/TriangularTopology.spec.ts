/* eslint-disable max-lines-per-function */
import { Set } from '@everyboard/lib';

import { Coord } from '../../Coord';
import { Direction } from '../../Direction';
import { Ordinal } from '../../Ordinal';
import { TriangularTopology } from '../TriangularTopology';

describe('TriangularTopology', () => {

    describe('getNextCoord', () => {

        it('should return the next coordinate in the given direction', () => {
            // Given a topology, a coord, and a direction
            const topology: TriangularTopology = new TriangularTopology();
            const coord: Coord = new Coord(2, 3);
            const direction: Direction = Ordinal.UP;

            // When evaluating next coord
            const result: Coord = topology.getNextCoord(coord, direction);

            // Then
            expect(result).toEqual(new Coord(2, 2));
        });

        it('should return the coordinate at the given distance in the given direction', () => {
            // Given
            const topology: TriangularTopology = new TriangularTopology();
            const coord: Coord = new Coord(2, 3);
            const direction: Direction = Ordinal.RIGHT;
            const distance: number = 3;

            // When evaluating next coord
            const result: Coord = topology.getNextCoord(coord, direction, distance);

            // Then
            expect(result).toEqual(new Coord(5, 3));
        });

        it('should return the coordinate in the opposite direction when the distance is negative', () => {
            // Given
            const topology: TriangularTopology = new TriangularTopology();
            const coord: Coord = new Coord(2, 3);
            const direction: Direction = Ordinal.UP;
            const distance: number = -2;

            // When evaluating next coord
            const result: Coord = topology.getNextCoord(coord, direction, distance);

            // Then
            expect(result).toEqual(new Coord(2, 5));
        });
    });

    describe('getNeighbors', () => {

        it('should return all 3 neighboring coordinates (even coord)', () => {
            // Given
            const topology: TriangularTopology = new TriangularTopology();
            const coord: Coord = new Coord(0, 1);

            // When evaluating neighbors
            const result: Set<Coord> = topology.getNeighbors(coord);

            // Then
            expect(
                result.equals(
                    new Set([
                        new Coord(-1, 1),
                        new Coord(1, 1),
                        new Coord(0, 0),
                    ]),
                ),
            ).toBeTrue();
        });

        it('should return all 3 neighboring coordinates (odd coord)', () => {
            // Given
            const topology: TriangularTopology = new TriangularTopology();
            const coord: Coord = new Coord(0, 0);

            // When evaluating neighbors
            const result: Set<Coord> = topology.getNeighbors(coord);

            // Then
            expect(
                result.equals(
                    new Set([
                        new Coord(-1, 0),
                        new Coord(1, 0),
                        new Coord(0, 1),
                    ]),
                ),
            ).toBeTrue();
        });
    });
});
