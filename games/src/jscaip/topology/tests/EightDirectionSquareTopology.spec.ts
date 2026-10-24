/* eslint-disable max-lines-per-function */
import { Set } from '@everyboard/lib';

import { Coord } from '../../Coord';
import { Direction } from '../../direction/Direction';
import { EightDirection } from '../../direction/EightDirection';
import { EightDirectionSquareTopology } from '../EightDirectionSquareTopology';

describe('EightDirectionSquareTopology', () => {

    describe('getNextCoord', () => {

        it('should return the next coordinate in the given direction', () => {
            // Given a topology, a coord, and a direction
            const topology: EightDirectionSquareTopology = new EightDirectionSquareTopology();
            const coord: Coord = new Coord(2, 3);
            const direction: Direction = EightDirection.UP;

            // When evaluating next coord
            const result: Coord = topology.getNextCoord(coord, direction);

            // Then it should return the correct coord
            expect(result).toEqual(new Coord(2, 2));
        });

        it('should return the coordinate at the given distance in the given direction', () => {
            // Given eight direction topology and negative distance
            const topology: EightDirectionSquareTopology = new EightDirectionSquareTopology();
            const coord: Coord = new Coord(2, 3);
            const direction: Direction = EightDirection.RIGHT;
            const distance: number = 3;

            // When evaluating next coord
            const result: Coord = topology.getNextCoord(coord, direction, distance);

            // Then it should return the correct coord
            expect(result).toEqual(new Coord(5, 3));
        });

        it('should return the coordinate in the opposite direction when the distance is negative', () => {
            // Given eight direction topology and negative distance
            const topology: EightDirectionSquareTopology = new EightDirectionSquareTopology();
            const coord: Coord = new Coord(2, 3);
            const direction: Direction = EightDirection.UP;
            const distance: number = -2;

            // When evaluating next coord
            const result: Coord = topology.getNextCoord(coord, direction, distance);

            // Then it should return the correct coord
            expect(result).toEqual(new Coord(2, 5));
        });
    });

    describe('getNeighbors', () => {
        it('should return all eight neighboring coordinates', () => {
            // Given eight direction topology
            const topology: EightDirectionSquareTopology = new EightDirectionSquareTopology();
            const coord: Coord = new Coord(2, 3);

            // When evaluating neighbors
            const result: Set<Coord> = topology.getNeighbors(coord);

            // Then it should return the 8 neighbors
            expect(
                result.equals(
                    new Set([
                        new Coord(1, 2), new Coord(2, 2), new Coord(3, 2),
                        new Coord(1, 3) /*            */, new Coord(3, 3),
                        new Coord(1, 4), new Coord(2, 4), new Coord(3, 4),
                    ]),
                ),
            ).toBeTrue();
        });
    });
});
