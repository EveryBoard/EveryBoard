/* eslint-disable max-lines-per-function */
import { ConnectSixDrops, ConnectSixFirstMove, ConnectSixMove } from '../ConnectSixMove';
import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils, TestUtils } from '@everyboard/lib';

describe('ConnectSixMove', () => {

    describe('ConnectSixDrops', () => {

        describe('of', () => {

            it('should not create move where first coord and second coord are the same', () => {
                function tryingIdenticalCoords(): void {
                    ConnectSixDrops.of(new Coord(0, 0), new Coord(0, 0));
                }
                TestUtils.expectToThrowAndLog(tryingIdenticalCoords, 'COORDS_SHOULD_BE_DIFFERENT');
            });

            it('should create move when inputs are valid', () => {
                expect(() => {
                    ConnectSixDrops.of(new Coord(0, 0), new Coord(1, 1));
                }).not.toThrow();
            });

        });

        describe('equals', () => {

            it('should be equal when coords are equal', () => {
                // Given two move with equal coord
                const first: ConnectSixDrops = ConnectSixDrops.of(new Coord(0, 0), new Coord(1, 1));
                const second: ConnectSixDrops = ConnectSixDrops.of(new Coord(0, 0), new Coord(1, 1));

                // When comparing them
                // Then they should be considered equal
                expect(first.equals(second)).toBeTrue();
            });

            it('should be different when one coord is different', () => {
                // Given two move with different coords
                const first: ConnectSixDrops = ConnectSixDrops.of(new Coord(0, 0), new Coord(1, 1));
                const second: ConnectSixDrops = ConnectSixDrops.of(new Coord(0, 0), new Coord(2, 2));

                // When comparing them
                // Then they should be considered different
                expect(first.equals(second)).toBeFalse();
            });

            it('should be equal when reversed, hence (a, b) == (b, a)', () => {
                // Given two move with equal coords but switched
                const first: ConnectSixDrops = ConnectSixDrops.of(new Coord(0, 0), new Coord(1, 1));
                const second: ConnectSixDrops = ConnectSixDrops.of(new Coord(1, 1), new Coord(0, 0));

                // When comparing them
                // Then they should be considered equal
                expect(first.equals(second)).toBeTrue();
            });

        });

    });

    describe('ConnectSixFirstMove', () => {

        describe('equals', () => {

            it('should be equal when coords are equal', () => {
                // Given two move with equal coord
                const first: ConnectSixFirstMove = ConnectSixFirstMove.of(new Coord(0, 0));
                const second: ConnectSixFirstMove = ConnectSixFirstMove.of(new Coord(0, 0));

                // When comparing them
                // Then they should be considered equal
                expect(first.equals(second)).toBeTrue();
            });

            it('should be different when coords are different', () => {
                // Given two move with different coord
                const first: ConnectSixFirstMove = ConnectSixFirstMove.of(new Coord(0, 0));
                const second: ConnectSixFirstMove = ConnectSixFirstMove.of(new Coord(1, 1));

                // When comparing them
                // Then they should be considered different
                expect(first.equals(second)).toBeFalse();
            });

        });

    });

    describe('encoder', () => {

        it('should be bijective', () => {
            const moves: ConnectSixMove[] = [
                ConnectSixFirstMove.of(new Coord(0, 0)),
                ConnectSixDrops.of(new Coord(0, 0), new Coord(1, 1)),
            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(ConnectSixMove.encoder, move);
            }

        });

    });

});
