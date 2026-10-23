/* eslint-disable max-lines-per-function */
import { MGPOptional, Set, expectEquality } from '@everyboard/lib';

import { Coord } from '../../Coord';
import { Direction } from '../../Direction';
import { EightDirection } from '../../EightDirection';
import { EightDirectionSquareTopology } from '../../topology/EightDirectionSquareTopology';
import { HexagonalTopology } from '../../topology/HexagonalTopology';
import { Topology } from '../../topology/Topology';
import { TriangularTopology } from '../../topology/TriangularTopology';
import { TorusShape } from '../TorusShape';
import { HexaDirection, TriangularDirection } from 'games/dist';

describe('TorusShape (with Square Topology)', () => {

    const topology: Topology<EightDirection> = new EightDirectionSquareTopology();

    describe('getCenters', () => {

        it('should return any coord (standardized to (0, 0) for simplicity)', () => {
            const shape: TorusShape<EightDirection> = new TorusShape(1, 1, topology);

            expect(shape.getCenters()).toEqual([
                new Coord(0, 0),
            ]);
        });

    });

    describe('getAllCoords', () => {

        it('should return the correct coordinates for side 1', () => {
            const shape: TorusShape<EightDirection> = new TorusShape(1, 1, topology);

            expect(shape.getAllCoords()).toEqual([
                new Coord(0, 0),
            ]);
        });

        it('should return the correct coordinates for side 2', () => {
            const shape: TorusShape<EightDirection> = new TorusShape(2, 2, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());

            const expectedSet: Set<Coord> = new Set([
                new Coord(0, 0), new Coord(1, 0),
                new Coord(0, 1), new Coord(1, 1),
            ]);
            expectEquality(expectedSet, actualSet);
        });

        it('should return the correct coordinates for side 3', () => {
            const shape: TorusShape<EightDirection> = new TorusShape(3, 3, topology);

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

describe('TorusShape (with Triangular Topology)', () => {

    const topology: Topology<TriangularDirection> = new TriangularTopology();

    describe('getCenters', () => {

        it('should return any coord (standardized to (0, 0) for simplicity)', () => {
            const shape: TorusShape<TriangularDirection> = new TorusShape(1, 1, topology);

            expect(shape.getCenters()).toEqual([
                new Coord(0, 0),
            ]);
        });

    });

    describe('getAllCoords', () => {

        it('should return the correct coordinates for side 1', () => {
            const shape: TorusShape<TriangularDirection> = new TorusShape(1, 1, topology);

            expect(shape.getAllCoords()).toEqual([
                new Coord(0, 0),
            ]);
        });

        it('should return the correct coordinates for side 2', () => {
            const shape: TorusShape<TriangularDirection> = new TorusShape(2, 2, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());

            const expectedSet: Set<Coord> = new Set([
                new Coord(0, 0), new Coord(1, 0),
                new Coord(0, 1), new Coord(1, 1),
            ]);
            expectEquality(expectedSet, actualSet);
        });

        it('should return the correct coordinates for side 3', () => {
            const shape: TorusShape<TriangularDirection> = new TorusShape(3, 3, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());
            const expectedSet: Set<Coord> = new Set([
                new Coord(0, 0), new Coord(1, 0), new Coord(2, 0),
                new Coord(0, 1), new Coord(1, 1), new Coord(2, 1),
                new Coord(0, 2), new Coord(1, 2), new Coord(2, 2),
            ]);
            expectEquality(expectedSet, actualSet);
        });

    });

    describe('getNextCoord', () => {

        it('should go across the board horizontally', () => {
            // Given a coord on the right edge of the board and a toric shape
            const shape: TorusShape<TriangularDirection> = new TorusShape(4, 4, topology);
            const coord: Coord = new Coord(3, 3);

            // When getting getNextCoord(RIGHT)
            const nextCoord: MGPOptional<Coord> = shape.getNextCoord(coord, EightDirection.RIGHT);

            // Then it should reach the left edge
            expect(nextCoord).toEqual(MGPOptional.of(new Coord(0, 3)));
        });

    });

});

describe('TorusShape (with Hexagonal Topology)', () => {

    const topology: Topology<HexaDirection> = new HexagonalTopology();

    describe('getCenters', () => {

        it('should return any coord (standardized to (0, 0) for simplicity)', () => {
            const shape: TorusShape<HexaDirection> = new TorusShape(1, 1, topology);

            expect(shape.getCenters()).toEqual([
                new Coord(0, 0),
            ]);
        });

    });

    describe('getAllCoords', () => {

        it('should return the correct coordinates for side 1', () => {
            const shape: TorusShape<HexaDirection> = new TorusShape(1, 1, topology);

            expect(shape.getAllCoords()).toEqual([
                new Coord(0, 0),
            ]);
        });

        it('should return the correct coordinates for side 2', () => {
            const shape: TorusShape<HexaDirection> = new TorusShape(2, 2, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());

            const expectedSet: Set<Coord> = new Set([
                new Coord(0, 0), new Coord(1, 0),
                new Coord(0, 1), new Coord(1, 1),
            ]);
            expectEquality(expectedSet, actualSet);
        });

        it('should return the correct coordinates for side 3', () => {
            const shape: TorusShape<HexaDirection> = new TorusShape(3, 3, topology);

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
