import { LodestonePiece, LodestonePieceLodestone, LodestonePieceNone, LodestonePiecePlayer } from '../LodestonePiece';

describe('LodestonePiece', () => {
    it('should redefine equals', () => {
        const empty: LodestonePiece = LodestonePieceNone.EMPTY;
        const unreachable: LodestonePiece = LodestonePieceNone.UNREACHABLE;
        const piece: LodestonePiece = LodestonePiecePlayer.ZERO;
        const lodestone: LodestonePiece = LodestonePieceLodestone.ZERO_PUSH_ORTHOGONAL;

        expect(empty.equals(unreachable)).toBeFalse();
        expect(empty.equals(empty)).toBeTrue();
        expect(empty.equals(piece)).toBeFalse();
        expect(empty.equals(lodestone)).toBeFalse();
        expect(piece.equals(empty)).toBeFalse();
        expect(piece.equals(unreachable)).toBeFalse();
        expect(piece.equals(piece)).toBeTrue();
        expect(piece.equals(lodestone)).toBeFalse();
        expect(lodestone.equals(empty)).toBeFalse();
        expect(lodestone.equals(unreachable)).toBeFalse();
        expect(lodestone.equals(piece)).toBeFalse();
        expect(lodestone.equals(lodestone)).toBeTrue();
    });
});
