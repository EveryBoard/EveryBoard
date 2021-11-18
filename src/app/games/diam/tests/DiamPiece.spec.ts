import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { DiamPiece } from '../DiamPiece';

describe('DiamPiece', () => {
    it('should correctly encode and decode all pieces', () => {
        for (const piece of [
            DiamPiece.EMPTY,
            DiamPiece.ZERO_FIRST, DiamPiece.ZERO_SECOND,
            DiamPiece.ONE_FIRST, DiamPiece.ONE_SECOND,
        ]) {
            NumberEncoderTestUtils.expectToBeCorrect(DiamPiece.encoder, piece);
        }
    });
    it('should have redefined toString', () => {
        expect(DiamPiece.ZERO_FIRST.toString()).toBe('DiamPiece(Player 0, false)');
    });
});
