/* eslint-disable max-lines-per-function */
import { NumberEncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { DiamPiece } from '../DiamPiece';

describe('DiamPiece', () => {
    it('should have a bijective encoder', () => {
        NumberEncoderTestUtils.expectToBeBijective(DiamPiece.encoder, DiamPiece.EMPTY);
        for (const piece of DiamPiece.PLAYER_PIECES) {
            NumberEncoderTestUtils.expectToBeBijective(DiamPiece.encoder, piece);
        }
    });
    it('should have redefined toString', () => {
        expect(DiamPiece.ZERO_FIRST.toString()).toBe('DiamPiece(PLAYER_ZERO, false)');
    });
});
