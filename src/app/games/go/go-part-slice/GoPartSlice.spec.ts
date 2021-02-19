import { Player } from 'src/app/jscaip/player/Player';
import { GoPartSlice, GoPiece, Phase } from './GoPartSlice';

describe('GoPartSlice', () => {

    it('Should throw when GoPiece.pieceBelongTo is called with Player.NONE', () => {
        const error: string = 'Owner must be Player.ZERO or Player.ONE, got Player.NONE.';
        expect(() => GoPiece.pieceBelongTo(GoPiece.BLACK, Player.NONE)).toThrowError(error);
    });
    it('Should throw when GoPiece.of is called with invalid number', () => {
        const error: string = 'Invalid value for GoPiece: 123.';
        expect(() => GoPiece.of(123)).toThrowError(error);
    });
    it('Should throw when constructor called with capture or phase as null', () => {
        expect(() => new GoPartSlice([], null, 1, null, Phase.ACCEPT)).toThrowError('Captured cannot be null.');
        expect(() => new GoPartSlice([], [], 1, null, null)).toThrowError('Phase cannot be null.');
    });
});
