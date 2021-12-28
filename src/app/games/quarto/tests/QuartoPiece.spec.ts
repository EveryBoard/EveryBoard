/* eslint-disable max-lines-per-function */
import { QuartoPiece } from '../QuartoPiece';

describe('QuartoPiece', () => {
    describe('equals', () => {
        it('should compare based on reference', () => {
            // given two different piece
            const first: QuartoPiece = QuartoPiece.AAAA;
            const same: QuartoPiece = QuartoPiece.AAAA;

            // when comparing them
            const equality: boolean = first.equals(same);

            // then result should be true
            expect(equality).toBeTrue();
        });
        it('should see different element', () => {
            // given two different piece
            const first: QuartoPiece = QuartoPiece.AAAA;
            const different: QuartoPiece = QuartoPiece.AAAB;

            // when comparing them
            const equality: boolean = first.equals(different);

            // then result should be true
            expect(equality).toBeFalse();
        });
    });
    describe('fromInt', () => {
        it('should throw if called with invalid number', () => {
            // given an invalid number
            const piece: number = -1;
            // when calling QuartoPiece.fromInt, then it should throw
            expect(() => QuartoPiece.fromInt(piece)).toThrowError('Invalid piece (' + piece + ')');
        });
    });
});
