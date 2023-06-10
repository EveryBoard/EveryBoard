/* eslint-disable max-lines-per-function */
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { ConnectSixDrops, ConnectSixFirstMove, ConnectSixMove } from '../ConnectSixMove';
import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';

describe('ConnectSixMove', () => {
    describe('ConnectSixDrops', () => {
        describe('from', () => {
            it('should not create move where first coord is out of board', () => {
                function tryingOutOfRangeFirstCoord(): void {
                    ConnectSixDrops.from(new Coord(-1, -1), new Coord(0, 0));
                }
                RulesUtils.expectToThrowAndLog(tryingOutOfRangeFirstCoord, 'FIRST_COORD_IS_OUT_OF_RANGE');
            });
            it('should not create move where second coord is out of board', () => {
                function tryingOutOfRangeSecondCoord(): void {
                    ConnectSixDrops.from(new Coord(0, 0), new Coord(-1, -1));
                }
                RulesUtils.expectToThrowAndLog(tryingOutOfRangeSecondCoord, 'SECOND_COORD_IS_OUT_OF_RANGE');
            });
            it('should not create move where first coord and second coord are the same', () => {
                function tryingIdenticalCoords(): void {
                    ConnectSixDrops.from(new Coord(0, 0), new Coord(0, 0));
                }
                RulesUtils.expectToThrowAndLog(tryingIdenticalCoords, 'COORDS_SHOULD_BE_DIFFERENT');
            });
            it('should create move when inputs are valid', () => {
                const move: MGPFallible<ConnectSixMove> = ConnectSixDrops.from(new Coord(0, 0), new Coord(1, 1));
                expect(move.isSuccess()).toBeTrue();
            });
        });
        describe('equals', () => {
            it('should be equal when coords are equal', () => {
                // Given two move with equal coord
                const first: ConnectSixDrops = ConnectSixDrops.from(new Coord(0, 0), new Coord(1, 1)).get();
                const second: ConnectSixDrops = ConnectSixDrops.from(new Coord(0, 0), new Coord(1, 1)).get();

                // When comparing them
                // Then they should be considered equal
                expect(first.equals(second)).toBeTrue();
            });
            it('should be different when one coord is different', () => {
                // Given two move with different coords
                const first: ConnectSixDrops = ConnectSixDrops.from(new Coord(0, 0), new Coord(1, 1)).get();
                const second: ConnectSixDrops = ConnectSixDrops.from(new Coord(0, 0), new Coord(2, 2)).get();

                // When comparing them
                // Then they should be considered different
                expect(first.equals(second)).toBeFalse();
            });
            it('should be equal when reversed, hence (a, b) == (b, a)', () => {
                // Given two move with equal coords but switched
                const first: ConnectSixDrops = ConnectSixDrops.from(new Coord(0, 0), new Coord(1, 1)).get();
                const second: ConnectSixDrops = ConnectSixDrops.from(new Coord(1, 1), new Coord(0, 0)).get();

                // When comparing them
                // Then they should be considered equal
                expect(first.equals(second)).toBeTrue();
            });
        });
    });
    describe('ConnectSixFirstMove', () => {
        it('should not create move when coord is out of board', () => {
            function tryingOutOfRangeCoord(): void {
                ConnectSixFirstMove.from(new Coord(-1, -1));
            }
            RulesUtils.expectToThrowAndLog(tryingOutOfRangeCoord, 'FIRST_COORD_IS_OUT_OF_RANGE');
        });
        it('should create move when coord is in the board', () => {
            const move: ConnectSixFirstMove = ConnectSixFirstMove.from(new Coord(0, 0)).get();
            expect(move).toBeTruthy();
        });
        describe('equals', () => {
            it('should be equal when coords are equal', () => {
                // Given two move with equal coord
                const first: ConnectSixFirstMove = ConnectSixFirstMove.from(new Coord(0, 0)).get();
                const second: ConnectSixFirstMove = ConnectSixFirstMove.from(new Coord(0, 0)).get();

                // When comparing them
                // Then they should be considered equal
                expect(first.equals(second)).toBeTrue();
            });
            it('should be different when coords are different', () => {
                // Given two move with different coord
                const first: ConnectSixFirstMove = ConnectSixFirstMove.from(new Coord(0, 0)).get();
                const second: ConnectSixFirstMove = ConnectSixFirstMove.from(new Coord(1, 1)).get();

                // When comparing them
                // Then they should be considered different
                expect(first.equals(second)).toBeFalse();
            });
        });
    });
    describe('encoder', () => {
        it('should be bijective', () => {
            const moves: ConnectSixMove[] = [
                ConnectSixFirstMove.from(new Coord(0, 0)).get(),
                ConnectSixDrops.from(new Coord(0, 0), new Coord(1, 1)).get(),
            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(ConnectSixMove.encoder, move);
            }
        });
    });
});
