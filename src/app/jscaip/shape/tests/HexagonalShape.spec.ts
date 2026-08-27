/* eslint-disable max-lines-per-function */
import { Set } from '@everyboard/lib';

import { Coord } from '../../Coord';
import { SquareTopology } from '../../topology/SquareTopology';
import { Topology } from '../../topology/Topology';
import { HexagonalShape } from '../HexagonalShape';

describe('HexagonalShape', () => {

    const topology: Topology = new SquareTopology();

    describe('getCenters', () => {

        it('should return the center for side 1', () => {
            const shape: HexagonalShape = new HexagonalShape(1, topology);

            expect(shape.getCenters()).toEqual([
                new Coord(0, 0),
            ]);
        });

        it('should return the center for side 2', () => {
            const shape: HexagonalShape = new HexagonalShape(2, topology);

            expect(shape.getCenters()).toEqual([
                new Coord(1, 1),
            ]);
        });

        it('should return the center for side 3', () => {
            const shape: HexagonalShape = new HexagonalShape(3, topology);

            expect(shape.getCenters()).toEqual([
                new Coord(2, 2),
            ]);
        });

    });

    describe('getAllCoords', () => {

        it('should return the correct coordinates for side 1', () => {
            const shape: HexagonalShape = new HexagonalShape(1, topology);

            expect(shape.getAllCoords()).toEqual([
                new Coord(0, 0),
            ]);
        });

        it('should return the correct coordinates for side 2', () => {
            const shape: HexagonalShape = new HexagonalShape(2, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());
            const expectedSet: Set<Coord> = new Set([
                                 new Coord(1, 0), new Coord(2, 0),
                new Coord(0, 1), new Coord(1, 1), new Coord(2, 1),
                new Coord(0, 2), new Coord(1, 2),
            ]);
            expect(actualSet.equals(expectedSet)).toBeTrue();
        });

        it('should return the correct coordinates for side 3', () => {
            const shape: HexagonalShape = new HexagonalShape(3, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());
            const expectedSet: Set<Coord> = new Set([
                                                  new Coord(2, 3), new Coord(3, 3), new Coord(4, 3),
                                 new Coord(1, 4), new Coord(2, 4), new Coord(3, 4), new Coord(4, 4),
                new Coord(0, 5), new Coord(1, 5), new Coord(2, 5), new Coord(3, 5), new Coord(4, 5),
                new Coord(0, 4), new Coord(1, 4), new Coord(2, 4), new Coord(3, 4),
                new Coord(0, 3), new Coord(1, 3), new Coord(2, 3),
            ]);
            expect(actualSet.equals(expectedSet)).toBeTrue();
        });

    });

});
