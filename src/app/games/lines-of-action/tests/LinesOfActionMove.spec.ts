import { Coord } from 'src/app/jscaip/Coord';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { JSONValue } from 'src/app/utils/utils';
import { LinesOfActionMove } from '../LinesOfActionMove';

describe('LinesOfActionMove', () => {
    const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(5, 3), new Coord(3, 5)).get();

    describe('encoder', () => {
        it('should correctly encode and decode', () => {
            NumberEncoderTestUtils.expectToBeCorrect(LinesOfActionMove.encoder, move);
        });
    });
    it('should not create a move outside of the board', () => {
        expect(LinesOfActionMove.of(new Coord(-1, 5), new Coord(3, 5))).toEqual(MGPFallible.failure('start coord is not in range'));
        expect(LinesOfActionMove.of(new Coord(7, 7), new Coord(9, 9))).toEqual(MGPFallible.failure('end coord is not in range'));
    });
    it('should not create a move with an invalid direction', () => {
        expect(LinesOfActionMove.of(new Coord(3, 3), new Coord(4, 5))).toEqual(MGPFallible.failure('Invalid delta for direction: 1, 2'));
    });
    describe('toString', () => {
        it('should be defined', () => {
            expect(move.toString()).toEqual('LinesOfActionMove((5, 3)->(3, 5))');
        });
    });
    describe('equal', () => {
        it('should consider a move equal to itself', () => {
            expect(move.equals(move)).toBeTrue();
        });
        it('should not consider equal moves with different starting coordinate', () => {
            const move2: LinesOfActionMove = LinesOfActionMove.of(new Coord(2, 4), new Coord(3, 5)).get();
            expect(move.equals(move2)).toBeFalse();
        });
        it('should not consider equal moves with different end coordinate', () => {
            const move2: LinesOfActionMove = LinesOfActionMove.of(new Coord(5, 3), new Coord(6, 4)).get();
            expect(move.equals(move2)).toBeFalse();
        });
    });
    describe('encode/decode', () => {
        it('should delegate encoding to encoder', () => {
            spyOn(LinesOfActionMove.encoder, 'encode').and.callThrough();
            const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(5, 3), new Coord(6, 4)).get();
            move.encode();

            expect(LinesOfActionMove.encoder.encode).toHaveBeenCalledTimes(1);
        });
        it('should delegate decoding to encoder', () => {
            spyOn(LinesOfActionMove.encoder, 'decode').and.callThrough();
            const move: LinesOfActionMove = LinesOfActionMove.of(new Coord(5, 3), new Coord(6, 4)).get();
            const encoded: JSONValue = move.encode();
            move.decode(encoded);

            expect(LinesOfActionMove.encoder.decode).toHaveBeenCalledTimes(1);
        });
    });
});
