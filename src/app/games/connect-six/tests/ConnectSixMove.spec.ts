/* eslint-disable max-lines-per-function */
import { ConnectSixDrops, ConnectSixFirstMove, ConnectSixMove } from '../ConnectSixMove';
import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { TestUtils } from 'src/app/utils/tests/TestUtils.spec';

describe('ConnectSixMove', () => {
    describe('ConnectSixDrops', () => {
        describe('from', () => {
            it('should not create move where first coord is out of board', () => {
                function tryingOutOfRangeFirstCoord(): void {
                    ConnectSixDrops.of(new Coord(-1, -1), new Coord(0, 0));
                }
                TestUtils.expectToThrowAndLog(tryingOutOfRangeFirstCoord, 'FIRST_COORD_IS_OUT_OF_RANGE');
            });
            it('should not create move where second coord is out of board', () => {
                function tryingOutOfRangeSecondCoord(): void {
                    ConnectSixDrops.of(new Coord(0, 0), new Coord(-1, -1));
                }
                TestUtils.expectToThrowAndLog(tryingOutOfRangeSecondCoord, 'SECOND_COORD_IS_OUT_OF_RANGE');
            });
            it('should not create move where first coord and second coord are the same', () => {
                function tryingIdenticalCoords(): void {
                    ConnectSixDrops.of(new Coord(0, 0), new Coord(0, 0));
                }
                TestUtils.expectToThrowAndLog(tryingIdenticalCoords, 'COORDS_SHOULD_BE_DIFFERENT');
            });
            it('should create move when inputs are valid', () => {
                ConnectSixDrops.of(new Coord(0, 0), new Coord(1, 1));
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
        it('should not create move when coord is out of board', () => {
            function tryingOutOfRangeCoord(): void {
                ConnectSixFirstMove.of(new Coord(-1, -1));
            }
            TestUtils.expectToThrowAndLog(tryingOutOfRangeCoord, 'FIRST_COORD_IS_OUT_OF_RANGE');
        });
        it('should create move when coord is in the board', () => {
            const move: ConnectSixFirstMove = ConnectSixFirstMove.of(new Coord(0, 0));
            expect(move).toBeTruthy();
        });
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
