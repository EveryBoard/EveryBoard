import { GipfPiece } from './GipfPiece';

describe('GipfPiece', () => {
    function checkEncodeDecode(piece: GipfPiece): void {
        expect(GipfPiece.encoder.decode(GipfPiece.encoder.encode(piece))).toBe(piece);
    }
    it('should correctly encode and decode empty piece', () => {
        checkEncodeDecode(GipfPiece.EMPTY);
    });
    it('should correctly encode and decode player pieces', () => {
        checkEncodeDecode(GipfPiece.PLAYER_ZERO);
        checkEncodeDecode(GipfPiece.PLAYER_ONE);
    });
    it('should never encode above the maxValue', () => {
        expect(GipfPiece.encoder.encode(GipfPiece.EMPTY) <= GipfPiece.encoder.maxValue()).toBeTrue();
        expect(GipfPiece.encoder.encode(GipfPiece.PLAYER_ZERO) <= GipfPiece.encoder.maxValue()).toBeTrue();
        expect(GipfPiece.encoder.encode(GipfPiece.PLAYER_ONE) <= GipfPiece.encoder.maxValue()).toBeTrue();
    });
});
