/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { DirectionFailure } from 'src/app/jscaip/Direction';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { LinesOfActionMove } from '../LinesOfActionMove';

describe('LinesOfActionMove', () => {

    const someMove: LinesOfActionMove = LinesOfActionMove.from(new Coord(5, 3), new Coord(3, 5)).get();

    it('should not create a move outside of the board', () => {
        expect(LinesOfActionMove.from(new Coord(-1, 5), new Coord(3, 5))).toEqual(MGPFallible.failure('start coord is not in range'));
        expect(LinesOfActionMove.from(new Coord(7, 7), new Coord(9, 9))).toEqual(MGPFallible.failure('end coord is not in range'));
    });

    it('should not create a move with an invalid direction', () => {
        const error: string = DirectionFailure.DIRECTION_MUST_BE_LINEAR();
        expect(LinesOfActionMove.from(new Coord(3, 3), new Coord(4, 5))).toEqual(MGPFallible.failure(error));
    });

    describe('toString', () => {

        it('should be defined', () => {
            expect(someMove.toString()).toEqual('LinesOfActionMove((5, 3)->(3, 5))');
        });

    });

    describe('equal', () => {

        it('should consider a move equal to itself', () => {
            expect(someMove.equals(someMove)).toBeTrue();
        });

        it('should not consider equal moves with different starting coordinate', () => {
            const move2: LinesOfActionMove = LinesOfActionMove.from(new Coord(2, 4), new Coord(3, 5)).get();
            expect(someMove.equals(move2)).toBeFalse();
        });

        it('should not consider equal moves with different end coordinate', () => {
            const move2: LinesOfActionMove = LinesOfActionMove.from(new Coord(5, 3), new Coord(6, 4)).get();
            expect(someMove.equals(move2)).toBeFalse();
        });

    });

    it('should have a bijective encoder', () => {
        const moves: LinesOfActionMove[] = [
            LinesOfActionMove.from(new Coord(5, 3), new Coord(6, 4)).get(),
            someMove,
        ];
        for (const move of moves) {
            EncoderTestUtils.expectToBeBijective(LinesOfActionMove.encoder, move);
        }
    });

});
