/* eslint-disable max-lines-per-function */
import { Set } from '@everyboard/lib';

import { Coord } from '../../Coord';
import { SquareTopology } from '../../topology/SquareTopology';
import { Topology } from '../../topology/Topology';
import { RectangularShape } from '../RectangularShape';
import { expectEquality } from './TriangularShape.spec';

describe('RectangularShape', () => {

    const topology: Topology = new SquareTopology();

    describe('getCenters', () => {

        it('should return the center for side 1', () => {
            const shape: RectangularShape = new RectangularShape(1, 1, topology);

            expect(shape.getCenters()).toEqual([
                new Coord(0, 0),
            ]);
        });

        it('should return all coords center for side 2', () => {
            const shape: RectangularShape = new RectangularShape(2, 2, topology);

            const actualCenters: Set<Coord> = new Set(shape.getCenters());

            const expectedCenters: Set<Coord> = new Set(shape.getAllCoords());
            expectEquality(expectedCenters, actualCenters);
        });

        it('should return the center for side 3', () => {
            const shape: RectangularShape = new RectangularShape(3, 3, topology);

            const actualCenters: Set<Coord> = new Set(shape.getCenters());

            const expectedCenters: Set<Coord> = new Set([
                new Coord(1, 1),
            ]);
            expectEquality(expectedCenters, actualCenters);
        });

        it('should return the 4 center for side 4', () => {
            const shape: RectangularShape = new RectangularShape(4, 4, topology);

            const actualCenters: Set<Coord> = new Set(shape.getCenters());

            const expectedCenters: Set<Coord> = new Set([
                new Coord(1, 1), new Coord(2, 1),
                new Coord(1, 2), new Coord(2, 2),
            ]);
            expectEquality(expectedCenters, actualCenters);
        });

    });

    describe('getAllCoords', () => {

        it('should return the correct coordinates for side 1', () => {
            const shape: RectangularShape = new RectangularShape(1, 1, topology);

            expect(shape.getAllCoords()).toEqual([
                new Coord(0, 0),
            ]);
        });

        it('should return the correct coordinates for side 2', () => {
            const shape: RectangularShape = new RectangularShape(2, 2, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());

            const expectedSet: Set<Coord> = new Set([
                new Coord(0, 0), new Coord(1, 0),
                new Coord(0, 1), new Coord(1, 1),
            ]);
            expectEquality(expectedSet, actualSet);
        });

        it('should return the correct coordinates for side 3', () => {
            const shape: RectangularShape = new RectangularShape(3, 3, topology);

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
