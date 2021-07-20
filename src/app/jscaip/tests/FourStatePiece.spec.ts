import { FourStatePiece } from '../FourStatePiece';
import { Player } from '../Player';

describe('FourStatePiece', () => {
    describe('playerOf', () => {
        it('Should throw when called with anything else than Player.ONE or Player.ZERO', () => {
            expect(() => FourStatePiece.ofPlayer(Player.NONE))
                .toThrowError('FourStatePiece.ofPlayer can only be called with Player.ZERO and Player.ONE.');
        });
    });
});
