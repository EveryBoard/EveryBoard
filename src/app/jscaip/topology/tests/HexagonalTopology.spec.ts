/* eslint-disable max-lines-per-function */
import { Set } from '@everyboard/lib';

import { Coord } from '../../Coord';
import { Direction } from '../../Direction';
import { Ordinal } from '../../Ordinal';
import { HexagonalTopology } from '../HexagonalTopology';

describe('HexagonalTopology', () => {

    describe('getNextCoord', () => {

        it('should return the next coordinate in the given direction', () => {
            // Given a topology, a coord, and a direction
            const topology: HexagonalTopology = new HexagonalTopology();
            const coord: Coord = new Coord(2, 3);
            const direction: Direction = Ordinal.UP;

            // When evaluating next coord
            const result: Coord = topology.getNextCoord(coord, direction);

            // Then
            expect(result).toEqual(new Coord(2, 2));
        });

        it('should return the coordinate at the given distance in the given direction', () => {
            // Given
            const topology: HexagonalTopology = new HexagonalTopology();
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
            const topology: HexagonalTopology = new HexagonalTopology();
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
        it('should return all 6 neighboring coordinates', () => {
            // Given
            const topology: HexagonalTopology = new HexagonalTopology();
            const coord: Coord = new Coord(0, 0);

            // When evaluating neighbors
            const result: Set<Coord> = topology.getNeighbors(coord);

            // Then
            const expected: Set<Coord> = new Set([
                new Coord(0, 1),
                new Coord(1, -1),
                new Coord(1, 0),
                new Coord(0, -1),
                new Coord(-1, 1),
                new Coord(-1, 0),
            ]);
            expect(result.equals(expected)).withContext(`expected ${ expected.toString() } but got ${ result.toString() }`).toBeTrue();
        });
    });
});
