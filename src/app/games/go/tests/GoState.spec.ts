import { Player } from 'src/app/jscaip/Player';
import { GoPiece } from '../GoState';

describe('GoState', () => {

    describe('GoPiece', () => {
        describe('GoPiece.ofPlayer', () => {
            it('should map correctly the normal player', () => {
                expect(GoPiece.ofPlayer(Player.ZERO)).toBe(GoPiece.BLACK);
                expect(GoPiece.ofPlayer(Player.ONE)).toBe(GoPiece.WHITE);
            });
            it('Should throw when GoPiece.of is called with invalid number', () => {
                const error: string = 'GoPiece.ofPlayer should only be called with Player.ZERO and Player.ONE.';
                expect(() => GoPiece.ofPlayer(Player.NONE)).toThrowError(error);
            });
        });
        it('Should throw when GoPiece.pieceBelongTo is called with Player.NONE', () => {
            const error: string = 'Assertion failure: Owner must be Player.ZERO or Player.ONE, got Player.NONE.';
            expect(() => GoPiece.pieceBelongTo(GoPiece.BLACK, Player.NONE)).toThrowError(error);
        });
    });
});
