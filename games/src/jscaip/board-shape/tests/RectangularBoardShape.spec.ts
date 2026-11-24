/* eslint-disable max-lines-per-function */
import { MGPOptional, Set, expectEquality } from '@everyboard/lib';

import { Coord } from '../../Coord';
import { EightDirection } from '../../direction/EightDirection';
import { EightDirectionSquareTopology } from '../../topology/EightDirectionSquareTopology';
import { Topology } from '../../topology/Topology';
import { RectangularBoardShape } from '../RectangularBoardShape';

describe(RectangularBoardShape.name, () => {

    const topology: Topology<EightDirection> = new EightDirectionSquareTopology();

    describe('getCenters', () => {

        it('should return the center for sideLength=1', () => {
            const shape: RectangularBoardShape<EightDirection> = new RectangularBoardShape(1, 1, topology);

            expect(shape.getCenters()).toEqual([
                new Coord(0, 0),
            ]);
        });

        it('should return all coords center for sideLength=2', () => {
            const shape: RectangularBoardShape<EightDirection> = new RectangularBoardShape(2, 2, topology);

            const actualCenters: Set<Coord> = new Set(shape.getCenters());

            const expectedCenters: Set<Coord> = new Set(shape.getAllCoords());
            expectEquality(expectedCenters, actualCenters);
        });

        it('should return the center for sideLength=3', () => {
            const shape: RectangularBoardShape<EightDirection> = new RectangularBoardShape(3, 3, topology);

            const actualCenters: Set<Coord> = new Set(shape.getCenters());

            const expectedCenters: Set<Coord> = new Set([
                new Coord(1, 1),
            ]);
            expectEquality(expectedCenters, actualCenters);
        });

        it('should return the 4 center for sideLength=4', () => {
            const shape: RectangularBoardShape<EightDirection> = new RectangularBoardShape(4, 4, topology);

            const actualCenters: Set<Coord> = new Set(shape.getCenters());

            const expectedCenters: Set<Coord> = new Set([
                new Coord(1, 1), new Coord(2, 1),
                new Coord(1, 2), new Coord(2, 2),
            ]);
            expectEquality(expectedCenters, actualCenters);
        });

    });

    describe('getNextCoord', () => {

        it('Should have all direction have the correct neighbors', () => {
            // Given a coord in the center of a sideLength=3 rectangle
            const center: Coord = new Coord(1, 1);
            const boardShape: RectangularBoardShape<EightDirection> = new RectangularBoardShape(3, 3, topology);

            // Then the first step in each direction should lead to one neighbor
            for (const direction of EightDirection.EIGHT_DIRECTIONS) {
                const neigbhor: MGPOptional<Coord> = boardShape.getNextCoord(center, direction, 1);
                const outside: MGPOptional<Coord> = boardShape.getNextCoord(center, direction, 2);
                expect(neigbhor).toEqual(MGPOptional.of(new Coord(center.x + direction.x, center.y + direction.y)));
                expect(outside).toEqual(MGPOptional.empty());
            }
        });

    });

    describe('getAllCoords', () => {

        it('should return the correct coordinates for sideLength=1', () => {
            const shape: RectangularBoardShape<EightDirection> = new RectangularBoardShape(1, 1, topology);

            expect(shape.getAllCoords()).toEqual([
                new Coord(0, 0),
            ]);
        });

        it('should return the correct coordinates for sideLength=2', () => {
            const shape: RectangularBoardShape<EightDirection> = new RectangularBoardShape(2, 2, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());

            const expectedSet: Set<Coord> = new Set([
                new Coord(0, 0), new Coord(1, 0),
                new Coord(0, 1), new Coord(1, 1),
            ]);
            expectEquality(expectedSet, actualSet);
        });

        it('should return the correct coordinates for sideLength=3', () => {
            const shape: RectangularBoardShape<EightDirection> = new RectangularBoardShape(3, 3, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());
            const expectedSet: Set<Coord> = new Set([
                new Coord(0, 0), new Coord(1, 0), new Coord(2, 0),
                new Coord(0, 1), new Coord(1, 1), new Coord(2, 1),
                new Coord(0, 2), new Coord(1, 2), new Coord(2, 2),
            ]);
            expectEquality(expectedSet, actualSet);
        });

    });

});
