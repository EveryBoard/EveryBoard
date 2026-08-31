/* eslint-disable indent */
/* eslint-disable max-lines-per-function */
import { Comparable, Set } from '@everyboard/lib';

import { Coord } from '../../Coord';
import { SquareTopology } from '../../topology/SquareTopology';
import { Topology } from '../../topology/Topology';
import { TriangularShape } from '../TriangularShape';

export function expectEquality<T extends Comparable>(expected: Set<T>, actual: Set<T>): void { // TODO: move it
    const missingInExpected: string | undefined = expected.getMissingElementFrom(actual)
        .map((element: T) => element?.toString())
        .getOrElse('');
    const unexpectedInActual: string | undefined = actual.getMissingElementFrom(expected)
        .map((element: T) => element?.toString())
        .getOrElse('');
    const context: string = `expected: ${ expected.toString() }` +
        `\nto be: ${ actual.toString() }` +
        `\nMissing in expected: ${ missingInExpected }` +
        `\nUnexpected in actual: ${ unexpectedInActual }`;
    expect(actual.equals(expected)).withContext(context).toBeTrue();
}



describe('TriangularShape', () => {

    const topology: Topology = new SquareTopology();

    describe('getCenters', () => {

        it('should return the center for side 1', () => {
            const shape: TriangularShape = new TriangularShape(1, topology);

            const actualCenters: Set<Coord> = new Set(shape.getCenters());

            const expectedCenters: Set<Coord> = new Set([
                new Coord(0, 0),
            ]);
            expectEquality(expectedCenters, actualCenters);
        });

        it('should return the center for side 2', () => {
            const shape: TriangularShape = new TriangularShape(2, topology);

            const actualCenters: Set<Coord> = new Set(shape.getCenters());

            const expectedCenters: Set<Coord> = new Set([
                new Coord(1, 1),
            ]);
            expectEquality(expectedCenters, actualCenters);
        });

        it('should return the 6 centers for side 3', () => {
            const shape: TriangularShape = new TriangularShape(3, topology);

            const actualCenters: Set<Coord> = new Set(shape.getCenters());

            const expectedCenters: Set<Coord> = new Set([
                new Coord(1, 1), new Coord(2, 1), new Coord(3, 1),
                new Coord(1, 2), new Coord(2, 2), new Coord(3, 2),
            ]);
            expectEquality(expectedCenters, actualCenters);
        });

        it('should return the center for side 4', () => {
            const shape: TriangularShape = new TriangularShape(4, topology);

            const actualCenters: Set<Coord> = new Set(shape.getCenters());

            const expectedCenters: Set<Coord> = new Set([
                new Coord(3, 2),
            ]);
            expectEquality(expectedCenters, actualCenters);
        });

        it('should return the center for side 5', () => {
            const shape: TriangularShape = new TriangularShape(5, topology);

            const actualCenters: Set<Coord> = new Set(shape.getCenters());

            const expectedCenters: Set<Coord> = new Set([
                new Coord(4, 3),
            ]);
            expectEquality(expectedCenters, actualCenters);
        });

        it('should return the 6 centers for side 6', () => {
            const shape: TriangularShape = new TriangularShape(6, topology);

            const actualCenters: Set<Coord> = new Set(shape.getCenters());

            const expectedCenters: Set<Coord> = new Set([
                new Coord(4, 3), new Coord(5, 3), new Coord(6, 3),
                new Coord(4, 4), new Coord(5, 4), new Coord(6, 4),
            ]);
            expectEquality(expectedCenters, actualCenters);
        });

    });

    describe('getAllCoords', () => {

        it('should return the correct coordinates for side 1', () => {
            const shape: TriangularShape = new TriangularShape(1, topology);

            expect(shape.getAllCoords()).toEqual([
                new Coord(0, 0),
            ]);
        });

        it('should return the correct coordinates for side 2', () => {
            const shape: TriangularShape = new TriangularShape(2, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());

            const expectedSet: Set<Coord> = new Set([
                                 new Coord(2, 0),
                new Coord(1, 1), new Coord(2, 1), new Coord(3, 1),
            ]);
            expectEquality(expectedSet, actualSet);
        });

        it('should return the correct coordinates for side 3', () => {
            const shape: TriangularShape = new TriangularShape(3, topology);

            const actualSet: Set<Coord> = new Set(shape.getAllCoords());
            const expectedSet: Set<Coord> = new Set([
                                                  new Coord(2, 0),
                                 new Coord(1, 1), new Coord(2, 1), new Coord(3, 1),
                new Coord(0, 2), new Coord(1, 2), new Coord(2, 2), new Coord(3, 2), new Coord(4, 2),
            ]);
            expectEquality(expectedSet, actualSet);
        });

    });

});
