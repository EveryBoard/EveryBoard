import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { DiamPiece } from '../DiamPiece';

describe('DiamPiece', () => {
    it('should correctly encode and decode all pieces', () => {
        NumberEncoderTestUtils.expectToBeCorrect(DiamPiece.encoder, DiamPiece.EMPTY);
        for (const piece of DiamPiece.PLAYER_PIECES) {
            NumberEncoderTestUtils.expectToBeCorrect(DiamPiece.encoder, piece);
        }
    });
    it('should have redefined toString', () => {
        expect(DiamPiece.ZERO_FIRST.toString()).toBe('DiamPiece(Player 0, false)');
    });
});
