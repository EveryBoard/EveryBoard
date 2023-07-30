/* eslint-disable max-lines-per-function */
import { FourStatePiece } from '../FourStatePiece';

describe('FourStatePiece', () => {

    it('should map correctly', () => {
        expect(FourStatePiece.of(FourStatePiece.EMPTY.value)).toBe(FourStatePiece.EMPTY);
        expect(FourStatePiece.of(FourStatePiece.UNREACHABLE.value)).toBe(FourStatePiece.UNREACHABLE);
        expect(FourStatePiece.of(FourStatePiece.ONE.value)).toBe(FourStatePiece.ONE);
        expect(FourStatePiece.of(FourStatePiece.ZERO.value)).toBe(FourStatePiece.ZERO);
        expect(() => FourStatePiece.of(-1)).toThrowError('FourStatePiece has no value matching -1');
    });
});
