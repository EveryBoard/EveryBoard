/* eslint-disable max-lines-per-function */
import { HexagonalConnectionDrops, HexagonalConnectionFirstMove, HexagonalConnectionMove } from '../HexagonalConnectionMove';
import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils, TestUtils } from '@everyboard/lib';

describe('HexagonalConnectionMove', () => {

    describe('HexagonalConnectionDrops', () => {

        describe('from', () => {

            it('should not create move where first coord and second coord are the same', () => {
                function tryingIdenticalCoords(): void {
                    HexagonalConnectionDrops.of(new Coord(0, 0), new Coord(0, 0));
                }
                TestUtils.expectToThrowAndLog(tryingIdenticalCoords, 'COORDS_SHOULD_BE_DIFFERENT');
            });

            it('should create move when inputs are valid', () => {
                HexagonalConnectionDrops.of(new Coord(0, 0), new Coord(1, 1));
            });

        });

        describe('equals', () => {

            it('should be equal when coords are equal', () => {
                // Given two move with equal coord
                const first: HexagonalConnectionDrops = HexagonalConnectionDrops.of(new Coord(0, 0), new Coord(1, 1));
                const second: HexagonalConnectionDrops = HexagonalConnectionDrops.of(new Coord(0, 0), new Coord(1, 1));

                // When comparing them
                // Then they should be considered equal
                expect(first.equals(second)).toBeTrue();
            });

            it('should be different when one coord is different', () => {
                // Given two move with different coords
                const first: HexagonalConnectionDrops = HexagonalConnectionDrops.of(new Coord(0, 0), new Coord(1, 1));
                const second: HexagonalConnectionDrops = HexagonalConnectionDrops.of(new Coord(0, 0), new Coord(2, 2));

                // When comparing them
                // Then they should be considered different
                expect(first.equals(second)).toBeFalse();
            });

            it('should be equal when reversed, hence (a, b) == (b, a)', () => {
                // Given two move with equal coords but switched
                const first: HexagonalConnectionDrops = HexagonalConnectionDrops.of(new Coord(0, 0), new Coord(1, 1));
                const second: HexagonalConnectionDrops = HexagonalConnectionDrops.of(new Coord(1, 1), new Coord(0, 0));

                // When comparing them
                // Then they should be considered equal
                expect(first.equals(second)).toBeTrue();
            });

        });

    });

    describe('HexagonalConnectionFirstMove', () => {

        it('should create move when coord is in the board', () => {
            const move: HexagonalConnectionFirstMove = HexagonalConnectionFirstMove.of(new Coord(0, 0));
            expect(move).toBeTruthy();
        });

        describe('equals', () => {

            it('should be equal when coords are equal', () => {
                // Given two move with equal coord
                const first: HexagonalConnectionFirstMove = HexagonalConnectionFirstMove.of(new Coord(0, 0));
                const second: HexagonalConnectionFirstMove = HexagonalConnectionFirstMove.of(new Coord(0, 0));

                // When comparing them
                // Then they should be considered equal
                expect(first.equals(second)).toBeTrue();
            });

            it('should be different when coords are different', () => {
                // Given two move with different coord
                const first: HexagonalConnectionFirstMove = HexagonalConnectionFirstMove.of(new Coord(0, 0));
                const second: HexagonalConnectionFirstMove = HexagonalConnectionFirstMove.of(new Coord(1, 1));

                // When comparing them
                // Then they should be considered different
                expect(first.equals(second)).toBeFalse();
            });

        });

    });

    describe('encoder', () => {

        it('should be bijective', () => {
            const moves: HexagonalConnectionMove[] = [
                HexagonalConnectionFirstMove.of(new Coord(0, 0)),
                HexagonalConnectionDrops.of(new Coord(0, 0), new Coord(1, 1)),
            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(HexagonalConnectionMove.encoder, move);
            }

        });

    });

});
