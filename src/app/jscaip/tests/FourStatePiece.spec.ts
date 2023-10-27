/* eslint-disable max-lines-per-function */
import { FourStatePiece } from '../FourStatePiece';

describe('FourStatePiece', () => {

    it('should map correctly', () => {
        expect(FourStatePiece.of(FourStatePiece.EMPTY.getValue())).toBe(FourStatePiece.EMPTY);
        expect(FourStatePiece.of(FourStatePiece.UNREACHABLE.getValue())).toBe(FourStatePiece.UNREACHABLE);
        expect(FourStatePiece.of(FourStatePiece.ONE.getValue())).toBe(FourStatePiece.ONE);
        expect(FourStatePiece.of(FourStatePiece.ZERO.getValue())).toBe(FourStatePiece.ZERO);
        expect(() => FourStatePiece.of(-1)).toThrowError('FourStatePiece has no value matching -1');
    });
});
