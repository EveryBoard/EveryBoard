/* eslint-disable max-lines-per-function */
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { YinshPiece } from '../YinshPiece';

describe('YinshPiece', () => {

    it('should correctly encode and decode all pieces', () => {
        for (const piece of [
            YinshPiece.NONE,
            YinshPiece.EMPTY,
            YinshPiece.MARKER_ZERO,
            YinshPiece.MARKER_ONE,
            YinshPiece.RING_ZERO,
            YinshPiece.RING_ONE]) {
            NumberEncoderTestUtils.expectToBeCorrect(YinshPiece.encoder, piece);
        }
    });
    it('should have redefined toString', () => {
        expect(YinshPiece.NONE.toString()).toBe('NONE');
        expect(YinshPiece.EMPTY.toString()).toBe('EMPTY');
        expect(YinshPiece.MARKER_ZERO.toString()).toBe('MARKER_ZERO');
        expect(YinshPiece.MARKER_ONE.toString()).toBe('MARKER_ONE');
        expect(YinshPiece.RING_ZERO.toString()).toBe('RING_ZERO');
        expect(YinshPiece.RING_ONE.toString()).toBe('RING_ONE');
    });
});
