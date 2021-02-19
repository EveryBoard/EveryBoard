import { GipfPiece } from './GipfPiece';

describe('GipfPiece', () => {
    function checkEncodeDecode(piece: GipfPiece): void {
        expect(GipfPiece.encoder.decode(GipfPiece.encoder.encode(piece))).toBe(piece);
    }
    it('should correctly encode and decode empty piece', () => {
        checkEncodeDecode(GipfPiece.EMPTY);
    });
    it('should correctly encode and decode simple pieces', () => {
        checkEncodeDecode(GipfPiece.PLAYER_ZERO_SIMPLE);
        checkEncodeDecode(GipfPiece.PLAYER_ONE_SIMPLE);
    });
    it('should correctly encode and decode double pieces', () => {
        checkEncodeDecode(GipfPiece.PLAYER_ZERO_DOUBLE);
        checkEncodeDecode(GipfPiece.PLAYER_ONE_DOUBLE);
    });
});
