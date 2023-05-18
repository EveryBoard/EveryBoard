/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { DiamPiece } from '../DiamPiece';

describe('DiamPiece', () => {
    it('should have a bijective encoder', () => {
        EncoderTestUtils.expectToBeBijective(DiamPiece.encoder, DiamPiece.EMPTY);
        for (const piece of DiamPiece.PLAYER_PIECES) {
            EncoderTestUtils.expectToBeBijective(DiamPiece.encoder, piece);
        }
    });
    it('should have redefined toString', () => {
        expect(DiamPiece.ZERO_FIRST.toString()).toBe('DiamPiece(PLAYER_ZERO, false)');
    });
});
