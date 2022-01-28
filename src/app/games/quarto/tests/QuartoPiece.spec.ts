/* eslint-disable max-lines-per-function */
import { QuartoPiece } from '../QuartoPiece';

describe('QuartoPiece', () => {
    describe('equals', () => {
        it('should compare based on reference', () => {
            // Given two different piece
            const first: QuartoPiece = QuartoPiece.AAAA;
            const same: QuartoPiece = QuartoPiece.AAAA;

            // When comparing them
            const equality: boolean = first.equals(same);

            // Then the result should be true
            expect(equality).toBeTrue();
        });
        it('should see different element', () => {
            // Given two different piece
            const first: QuartoPiece = QuartoPiece.AAAA;
            const different: QuartoPiece = QuartoPiece.AAAB;

            // When comparing them
            const equality: boolean = first.equals(different);

            // Then the result should be true
            expect(equality).toBeFalse();
        });
    });
    describe('fromInt', () => {
        it('should throw if called with invalid number', () => {
            // Given an invalid number
            const piece: number = -1;
            // When calling QuartoPiece.fromInt
            // Then it should throw
            expect(() => QuartoPiece.fromInt(piece)).toThrowError('Invalid piece (' + piece + ')');
        });
        it('should succeed for all valid pieces', () => {
            // Given any valid piece number
            for (let piece: number = 0; piece <= 16; piece++) {
                // When calling QuartoPiece.fromInt
                // Then it should suceed
                expect(() => QuartoPiece.fromInt(piece)).not.toThrowError();
            }
        });
    });
});
