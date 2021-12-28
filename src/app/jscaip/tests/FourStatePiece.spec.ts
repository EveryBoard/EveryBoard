/* eslint-disable max-lines-per-function */
import { FourStatePiece } from '../FourStatePiece';
import { Player } from '../Player';

describe('FourStatePiece', () => {

    describe('playerOf', () => {
        it('Should throw when called with anything else than Player.ONE or Player.ZERO', () => {
            expect(() => FourStatePiece.ofPlayer(Player.NONE))
                .toThrowError('FourStatePiece.ofPlayer can only be called with Player.ZERO and Player.ONE.');
        });
    });
    it('should map correctly', () => {
        expect(FourStatePiece.from(FourStatePiece.EMPTY.value)).toBe(FourStatePiece.EMPTY);
        expect(FourStatePiece.from(FourStatePiece.NONE.value)).toBe(FourStatePiece.NONE);
        expect(FourStatePiece.from(FourStatePiece.ONE.value)).toBe(FourStatePiece.ONE);
        expect(FourStatePiece.from(FourStatePiece.ZERO.value)).toBe(FourStatePiece.ZERO);
        expect(() => FourStatePiece.from(-1)).toThrowError('FourStatePiece has no value matching -1');
    });
});
