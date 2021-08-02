import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { GipfPiece } from '../GipfPiece';

describe('GipfPiece', () => {
    it('should correctly encode and decode empty piece', () => {
        NumberEncoderTestUtils.expectToBeCorrect(GipfPiece.encoder, GipfPiece.EMPTY);
    });
    it('should correctly encode and decode player pieces', () => {
        NumberEncoderTestUtils.expectToBeCorrect(GipfPiece.encoder, GipfPiece.PLAYER_ZERO);
        NumberEncoderTestUtils.expectToBeCorrect(GipfPiece.encoder, GipfPiece.PLAYER_ONE);
    });
});
