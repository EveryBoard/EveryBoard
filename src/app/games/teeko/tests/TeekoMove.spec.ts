/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { TeekoDropMove, TeekoMove, TeekoTranslateMove } from '../TeekoMove';
import { Coord, CoordFailure } from 'src/app/jscaip/Coord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

describe('TeekoMove', () => {
    describe('TeekoDropMove', () => {
        describe('from', () => {
            it('should fail when not in range', () => {
                // Given an out of range coord
                const coord: Coord = new Coord(6, 6);

                // When calling TeekoDropMove.from
                const fallible: MGPFallible<TeekoDropMove> = TeekoDropMove.from(coord);

                // Then it should be failed because its out of range
                expect(fallible).toEqual(MGPFallible.failure(CoordFailure.OUT_OF_RANGE(coord)));
            });
            it('should fail for static move', () => {
                // Given a static move created with the same start and end coord
                const coord: Coord = new Coord(3, 4);

                // When calling from
                const move: MGPFallible<TeekoTranslateMove> = TeekoTranslateMove.from(coord, coord);

                // Then it should be invalid because it's a static move
                expect(move).toEqual(MGPFallible.failure(RulesFailure.MOVE_CANNOT_BE_STATIC()));
            });
        });
        describe('toString', () => {
            it('should be defined', () => {
                const move: TeekoDropMove = TeekoDropMove.from(new Coord(3, 4)).get();
                expect(move.toString()).toEqual('TeekoMove(3, 4)');
            });
        });
        describe('equals', () => {
            it('should return true for the same move', () => {
                const move: TeekoDropMove = TeekoDropMove.from(new Coord(3, 4)).get();
                expect(move.equals(move)).toBeTrue();
            });
            it('should return false for another move', () => {
                const move: TeekoDropMove = TeekoDropMove.from(new Coord(3, 4)).get();
                const otherMove: TeekoDropMove = TeekoDropMove.from(new Coord(2, 2)).get();
                expect(move.equals(otherMove)).toBeFalse();
            });
            it('should return false for a translation move', () => {
                const coord: Coord = new Coord(3, 4);
                const move: TeekoDropMove = TeekoDropMove.from(coord).get();
                const otherMove: TeekoTranslateMove = TeekoTranslateMove.from(coord, new Coord(4, 4)).get();
                expect(move.equals(otherMove)).toBeFalse();
            });
        });
    });
    describe('TeekoTranslateMove', () => {
        describe('from', () => {
            it('should fail when start not in range', () => {
                // Given an out of range coord
                const goodCoord: Coord = new Coord(3, 3);
                const badCoord: Coord = new Coord(6, 6);

                // When calling TeekoDropMove.from
                const fallible: MGPFallible<TeekoTranslateMove> = TeekoTranslateMove.from(badCoord, goodCoord);

                // Then it should be failed because its out of range
                expect(fallible).toEqual(MGPFallible.failure(CoordFailure.OUT_OF_RANGE(badCoord)));
            });
            it('should fail when end not in range', () => {
                // Given an out of range coord
                const goodCoord: Coord = new Coord(3, 3);
                const badCoord: Coord = new Coord(6, 6);

                // When calling TeekoDropMove.from
                const fallible: MGPFallible<TeekoTranslateMove> = TeekoTranslateMove.from(goodCoord, badCoord);

                // Then it should be failed because its out of range
                expect(fallible).toEqual(MGPFallible.failure(CoordFailure.OUT_OF_RANGE(badCoord)));
            });
        });
        describe('toString', () => {
            it('should be defined', () => {
                const move: TeekoTranslateMove = TeekoTranslateMove.from(new Coord(1, 2), new Coord(3, 4)).get();
                expect(move.toString()).toEqual('TeekoMove((1, 2) -> (3, 4))');
            });
        });
        describe('equals', () => {
            it('should return true for the same move', () => {
                const move: TeekoTranslateMove = TeekoTranslateMove.from(new Coord(1, 2), new Coord(3, 4)).get();
                expect(move.equals(move)).toBeTrue();
            });
            it('should return false for another move', () => {
                const move: TeekoTranslateMove = TeekoTranslateMove.from(new Coord(1, 2), new Coord(3, 4)).get();
                const otherMove: TeekoTranslateMove = TeekoTranslateMove.from(new Coord(2, 2), new Coord(3, 4)).get();
                expect(move.equals(otherMove)).toBeFalse();
            });
            it('should return false for a drop move', () => {
                const coord: Coord = new Coord(3, 4);
                const move: TeekoTranslateMove = TeekoTranslateMove.from(coord, new Coord(4, 4)).get();
                const otherMove: TeekoDropMove = TeekoDropMove.from(coord).get();
                expect(move.equals(otherMove)).toBeFalse();
            });
        });
    });
    describe('encoder', () => {
        it('should be bijective', () => {
            // We want to ensure that decoding an encoded move returns the same move.
            // Use `EncoderTestUtils.expectToBeBijective` for this.
            const moves: TeekoMove[] = [
                TeekoDropMove.from(new Coord(3, 4)).get(),
                TeekoTranslateMove.from(new Coord(1, 2), new Coord(3, 4)).get(),
            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(TeekoMove.encoder, move);
            }
        });
    });
});
