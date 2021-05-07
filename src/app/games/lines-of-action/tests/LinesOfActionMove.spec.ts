import { Coord } from 'src/app/jscaip/Coord';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { JSONValue } from 'src/app/utils/utils';
import { LinesOfActionMove } from '../LinesOfActionMove';

describe('LinesOfActionMove', () => {
    const move: LinesOfActionMove = new LinesOfActionMove(new Coord(5, 3), new Coord(3, 5));

    describe('encoder', () => {
        it('should correctly encode and decode', () => {
            NumberEncoderTestUtils.expectToBeCorrect(LinesOfActionMove.encoder, move);
        });
    });
    it('should fail when creating a move outside of the board', () => {
        expect(() => new LinesOfActionMove(new Coord(-1, 5), new Coord(3, 5))).toThrow();
        expect(() => new LinesOfActionMove(new Coord(3, 5), new Coord(10, 3))).toThrow();
    });
    it('should fail when creating a move with no direction', () => {
        expect(() => new LinesOfActionMove(new Coord(3, 3), new Coord(4, 5))).toThrow();
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
            const move2: LinesOfActionMove = new LinesOfActionMove(new Coord(2, 4), new Coord(3, 5));
            expect(move.equals(move2)).toBeFalse();
        });
        it('should not consider equal moves with different end coordinate', () => {
            const move2: LinesOfActionMove = new LinesOfActionMove(new Coord(5, 3), new Coord(6, 4));
            expect(move.equals(move2)).toBeFalse();
        });
    });
    describe('encode/decode', () => {
        it('should delegate encoding to encoder', () => {
            spyOn(LinesOfActionMove.encoder, 'encode').and.callThrough();
            const move: LinesOfActionMove = new LinesOfActionMove(new Coord(5, 3), new Coord(6, 4));
            move.encode();

            expect(LinesOfActionMove.encoder.encode).toHaveBeenCalledTimes(1);
        });
        it('should delegate decoding to encoder', () => {
            spyOn(LinesOfActionMove.encoder, 'decode').and.callThrough();
            const move: LinesOfActionMove = new LinesOfActionMove(new Coord(5, 3), new Coord(6, 4));
            const encoded: JSONValue = move.encode();
            move.decode(encoded);

            expect(LinesOfActionMove.encoder.decode).toHaveBeenCalledTimes(1);
        });
    });
});
