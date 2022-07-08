/* eslint-disable max-lines-per-function */
import { FourStatePiece } from '../FourStatePiece';

describe('FourStatePiece', () => {

    it('should map correctly', () => {
        expect(FourStatePiece.from(FourStatePiece.EMPTY.value)).toBe(FourStatePiece.EMPTY);
        expect(FourStatePiece.from(FourStatePiece.UNREACHABLE.value)).toBe(FourStatePiece.UNREACHABLE);
        expect(FourStatePiece.from(FourStatePiece.ONE.value)).toBe(FourStatePiece.ONE);
        expect(FourStatePiece.from(FourStatePiece.ZERO.value)).toBe(FourStatePiece.ZERO);
        expect(() => FourStatePiece.from(-1)).toThrowError('FourStatePiece has no value matching -1');
    });
});
