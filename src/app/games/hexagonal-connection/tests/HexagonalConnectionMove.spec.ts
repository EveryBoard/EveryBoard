/* eslint-disable max-lines-per-function */
import { HexagonalConnectionMove } from '../HexagonalConnectionMove';
import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils } from '@everyboard/lib';

describe('HexagonalConnectionMove', () => {

    describe('of', () => {

        it('should return duplicate-free instance', () => {
            const badInstance: HexagonalConnectionMove =
                HexagonalConnectionMove.of([new Coord(0, 0), new Coord(0, 0)]);
            const goodInstance: HexagonalConnectionMove =
                HexagonalConnectionMove.of([new Coord(0, 0)]);
            expect(badInstance.equals(goodInstance)).toBeTrue();
        });

        it('should create move when inputs are valid', () => {
            HexagonalConnectionMove.of([new Coord(0, 0), new Coord(1, 1)]);
        });

    });

    describe('equals', () => {

        it('should be equal when coords are equal', () => {
            // Given two move with equal coord
            const first: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(0, 0), new Coord(1, 1)]);
            const second: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(0, 0), new Coord(1, 1)]);

            // When comparing them
            // Then they should be considered equal
            expect(first.equals(second)).toBeTrue();
        });

        it('should be different when one coord is different', () => {
            // Given two move with different coords
            const first: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(0, 0), new Coord(1, 1)]);
            const second: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(0, 0), new Coord(2, 2)]);

            // When comparing them
            // Then they should be considered different
            expect(first.equals(second)).toBeFalse();
        });

        it('should be equal when reversed, hence (a, b) == (b, a)', () => {
            // Given two move with equal coords but switched
            const first: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(0, 0), new Coord(1, 1)]);
            const second: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(1, 1), new Coord(0, 0)]);

            // When comparing them
            // Then they should be considered equal
            expect(first.equals(second)).toBeTrue();
        });

        it('should be equal when coord is equal', () => {
            // Given two move with equal coord
            const first: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(0, 0)]);
            const second: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(0, 0)]);

            // When comparing them
            // Then they should be considered equal
            expect(first.equals(second)).toBeTrue();
        });

        it('should be different when coords are different', () => {
            // Given two move with different coord
            const first: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(0, 0)]);
            const second: HexagonalConnectionMove = HexagonalConnectionMove.of([new Coord(1, 1)]);

            // When comparing them
            // Then they should be considered different
            expect(first.equals(second)).toBeFalse();
        });

    });

    describe('encoder', () => {

        it('should be bijective', () => {
            const moves: HexagonalConnectionMove[] = [
                HexagonalConnectionMove.of([new Coord(0, 0)]),
                HexagonalConnectionMove.of([new Coord(0, 0), new Coord(1, 1)]),
            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(HexagonalConnectionMove.encoder, move);
            }

        });

    });

});
