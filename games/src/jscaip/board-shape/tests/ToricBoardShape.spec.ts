/* eslint-disable max-lines-per-function */
import { MGPOptional, Set, expectEquality } from '@everyboard/lib';

import { Coord } from '../../Coord';
import { EightDirection } from '../../direction/EightDirection';
import { HexaDirection } from '../../direction/HexaDirection';
import { TriangularDirection } from '../../direction/TriangularDirection';
import { EightDirectionSquareTopology } from '../../topology/EightDirectionSquareTopology';
import { HexagonalTopology } from '../../topology/HexagonalTopology';
import { Topology } from '../../topology/Topology';
import { TriangularTopology } from '../../topology/TriangularTopology';
import { ToricBoardShape } from '../ToricBoardShape';

describe(ToricBoardShape.name + ' (with Square Topology)', () => {

    const topology: Topology<EightDirection> = new EightDirectionSquareTopology();

    describe('getCenters', () => {

        it('should return any coord (standardized to (0, 0) for simplicity)', () => {
            const shape: ToricBoardShape<EightDirection> = new ToricBoardShape(1, 1, topology);

            expect(shape.getCenters()).toEqual([
                new Coord(0, 0),
            ]);
        });

    });

    describe('getAllCoords', () => {

        it('should return the correct coordinates for sideLength=1', () => {
            const shape: ToricBoardShape<EightDirection> = new ToricBoardShape(1, 1, topology);

            expect(shape.getAllCoords()).toEqual([
                new Coord(0, 0),
            ]);
        });

        it('should return the correct coordinates for sideLength=2', () => {
            const shape: ToricBoardShape<EightDirection> = new ToricBoardShape(2, 2, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());

            const expectedSet: Set<Coord> = new Set([
                new Coord(0, 0), new Coord(1, 0),
                new Coord(0, 1), new Coord(1, 1),
            ]);
            expectEquality(expectedSet, actualSet);
        });

        it('should return the correct coordinates for sideLength=3', () => {
            const shape: ToricBoardShape<EightDirection> = new ToricBoardShape(3, 3, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());
            const expectedSet: Set<Coord> = new Set([
                new Coord(0, 0), new Coord(1, 0), new Coord(2, 0),
                new Coord(0, 1), new Coord(1, 1), new Coord(2, 1),
                new Coord(0, 2), new Coord(1, 2), new Coord(2, 2),
            ]);
            expectEquality(expectedSet, actualSet);
        });

    });

    describe('isOnBoard / isNotOnBoard / getAllCoords', () => {

        it('should include the good coords', () => {
            // Given a matrix where (0, 0) will be interpreted as the coord (-1, -1)
            // and whose value are wether or not that coord should count as on board on a side=2 hexagon
            const shape: ToricBoardShape<EightDirection> = new ToricBoardShape(2, 2, topology);
            const allCoords: Coord[] = shape.getAllCoords();
            const matrix: boolean[][] = [
                [false, false, false, false],
                [false, true, true, false],
                [false, true, true, false],
                [false, false, false, false],
            ];

            // When checking each coord if they're on board
            // Then reality should map this map
            for (let y: number = 0; y < matrix.length; y++) {
                for (let x: number = 0; x < matrix[y].length; x++) {
                    const expected: boolean = matrix[y][x];
                    const coord: Coord = new Coord(x - 1, y - 1);
                    const coordIsAmongstAllCoord: boolean = allCoords.some((c: Coord) => c.equals(coord));
                    const isOnBoard: boolean = shape.isOnBoard(coord);
                    const isNotOnBoard: boolean = shape.isNotOnBoard(coord);
                    const message: string = expected ?
                        `${ coord.toString() } should be part of ${ JSON.stringify(allCoords) } but is not` :
                        `${ coord.toString() } should not be part of ${ JSON.stringify(allCoords) } but is`;
                    expect(coordIsAmongstAllCoord)
                        .withContext(message)
                        .toBe(expected);
                    expect(isOnBoard)
                        .withContext(`isOnBoard(${ coord.toString() }) should be ${ expected }`)
                        .toBe(expected);
                    expect(isNotOnBoard)
                        .withContext(`isNotOnBoard(${ coord.toString() }) should be ${ !expected }`)
                        .toBe(!expected);
                }
            }
        });
    });

});

describe(ToricBoardShape.name + ' (with Triangular Topology)', () => {

    const topology: Topology<TriangularDirection> = new TriangularTopology();

    describe('getCenters', () => {

        it('should return any coord (standardized to (0, 0) for simplicity)', () => {
            const shape: ToricBoardShape<TriangularDirection> = new ToricBoardShape(1, 1, topology);

            expect(shape.getCenters()).toEqual([
                new Coord(0, 0),
            ]);
        });

    });

    describe('getAllCoords', () => {

        it('should return the correct coordinates for sideLength=1', () => {
            const shape: ToricBoardShape<TriangularDirection> = new ToricBoardShape(1, 1, topology);

            expect(shape.getAllCoords()).toEqual([
                new Coord(0, 0),
            ]);
        });

        it('should return the correct coordinates for sideLength=2', () => {
            const shape: ToricBoardShape<TriangularDirection> = new ToricBoardShape(2, 2, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());

            const expectedSet: Set<Coord> = new Set([
                new Coord(0, 0), new Coord(1, 0),
                new Coord(0, 1), new Coord(1, 1),
            ]);
            expectEquality(expectedSet, actualSet);
        });

        it('should return the correct coordinates for sideLength=3', () => {
            const shape: ToricBoardShape<TriangularDirection> = new ToricBoardShape(3, 3, topology);

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
            const shape: ToricBoardShape<TriangularDirection> = new ToricBoardShape(4, 4, topology);
            const coord: Coord = new Coord(3, 3);

            // When getting getNextCoord(RIGHT)
            const nextCoord: MGPOptional<Coord> = shape.getNextCoord(coord, TriangularDirection.RIGHT);

            // Then it should reach the left edge
            expect(nextCoord).toEqual(MGPOptional.of(new Coord(0, 3)));
        });

    });

});

describe(ToricBoardShape.name + ' (with Hexagonal Topology)', () => {

    const topology: Topology<HexaDirection> = new HexagonalTopology();

    describe('getCenters', () => {

        it('should return any coord (standardized to (0, 0) for simplicity)', () => {
            const shape: ToricBoardShape<HexaDirection> = new ToricBoardShape(1, 1, topology);

            expect(shape.getCenters()).toEqual([
                new Coord(0, 0),
            ]);
        });

    });

    describe('getAllCoords', () => {

        it('should return the correct coordinates for sideLength=1', () => {
            const shape: ToricBoardShape<HexaDirection> = new ToricBoardShape(1, 1, topology);

            expect(shape.getAllCoords()).toEqual([
                new Coord(0, 0),
            ]);
        });

        it('should return the correct coordinates for sideLength=2', () => {
            const shape: ToricBoardShape<HexaDirection> = new ToricBoardShape(2, 2, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());

            const expectedSet: Set<Coord> = new Set([
                new Coord(0, 0), new Coord(1, 0),
                new Coord(0, 1), new Coord(1, 1),
            ]);
            expectEquality(expectedSet, actualSet);
        });

        it('should return the correct coordinates for sideLength=3', () => {
            const shape: ToricBoardShape<HexaDirection> = new ToricBoardShape(3, 3, topology);

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
