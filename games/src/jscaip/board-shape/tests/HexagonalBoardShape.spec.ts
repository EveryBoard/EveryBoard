/* eslint-disable indent */
/* eslint-disable max-lines-per-function */
import { MGPOptional, Set, expectEquality } from '@everyboard/lib';

import { Coord } from '../../Coord';
import { HexaDirection } from '../../direction/HexaDirection';
import { HexagonalTopology } from '../../topology/HexagonalTopology';
import { Topology } from '../../topology/Topology';
import { HexagonalBoardShape } from '../HexagonalBoardShape';

describe(HexagonalBoardShape.name, () => {

    const topology: Topology<HexaDirection> = new HexagonalTopology();

    describe('getCenters', () => {

        it('should return the center for sideLength=1', () => {
            const shape: HexagonalBoardShape<HexaDirection> = new HexagonalBoardShape(1, topology);

            expect(shape.getCenters()).toEqual([
                new Coord(0, 0),
            ]);
        });

        it('should return the center for sideLength=2', () => {
            const shape: HexagonalBoardShape<HexaDirection> = new HexagonalBoardShape(2, topology);

            expect(shape.getCenters()).toEqual([
                new Coord(1, 1),
            ]);
        });

        it('should return the center for sideLength=3', () => {
            const shape: HexagonalBoardShape<HexaDirection> = new HexagonalBoardShape(3, topology);

            expect(shape.getCenters()).toEqual([
                new Coord(2, 2),
            ]);
        });

    });

    describe('getNextCoord', () => {

        it('Should have all direction have the correct neighbors', () => {
            // Given a coord in the center of a sideLength=2 hexagonal
            const center: Coord = new Coord(1, 1);
            const boardShape: HexagonalBoardShape<HexaDirection> = new HexagonalBoardShape(2, topology);

            // Then the first step in each direction should lead to one neighbor
            for (const direction of HexaDirection.factory.all) {
                const neigbhor: MGPOptional<Coord> = boardShape.getNextCoord(center, direction, 1);
                const outside: MGPOptional<Coord> = boardShape.getNextCoord(center, direction, 2);
                expect(neigbhor).toEqual(MGPOptional.of(new Coord(center.x + direction.x, center.y + direction.y)));
                expect(outside).toEqual(MGPOptional.empty());
            }
        });

    });

    describe('getAllCoords', () => {

        it('should return the correct coordinates for sideLength=1', () => {
            const shape: HexagonalBoardShape<HexaDirection> = new HexagonalBoardShape(1, topology);

            expect(shape.getAllCoords()).toEqual([
                new Coord(0, 0),
            ]);
        });

        it('should return the correct coordinates for sideLength=2', () => {
            const shape: HexagonalBoardShape<HexaDirection> = new HexagonalBoardShape(2, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());
            const expectedSet: Set<Coord> = new Set([
                                 new Coord(1, 0), new Coord(2, 0),
                new Coord(0, 1), new Coord(1, 1), new Coord(2, 1),
                new Coord(0, 2), new Coord(1, 2),
            ]);
            expectEquality(expectedSet, actualSet);
        });

        it('should return the correct coordinates for sideLength=3', () => {
            const shape: HexagonalBoardShape<HexaDirection> = new HexagonalBoardShape(3, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());
            const expectedSet: Set<Coord> = new Set([
                                                  new Coord(2, 0), new Coord(3, 0), new Coord(4, 0),
                                 new Coord(1, 1), new Coord(2, 1), new Coord(3, 1), new Coord(4, 1),
                new Coord(0, 2), new Coord(1, 2), new Coord(2, 2), new Coord(3, 2), new Coord(4, 2),
                new Coord(0, 3), new Coord(1, 3), new Coord(2, 3), new Coord(3, 3),
                new Coord(0, 4), new Coord(1, 4), new Coord(2, 4),
            ]);
            expectEquality(expectedSet, actualSet);
        });

    });

    describe('isOnBoard / isNotOnBoard / getAllCoords', () => {

        it('should include the good coords', () => {
            // Given a matrix where (0, 0) will be interpreted as the coord (-1, -1)
            // and whose value are wether or not that coord should count as on board on a side=2 hexagon
            const shape: HexagonalBoardShape<HexaDirection> = new HexagonalBoardShape(2, topology);
            const allCoords: Coord[] = shape.getAllCoords();
            const matrix: boolean[][] = [
                [false, false, false, false, false],
                [false, false, true, true, false],
                [false, true, true, true, false],
                [false, true, true, false, false],
                [false, false, false, false, false],
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

