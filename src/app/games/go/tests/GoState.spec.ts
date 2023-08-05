/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { GoPiece } from '../GoState';

describe('GoState', () => {

    describe('GoPiece', () => {
        describe('toString', () => {
            it('should be defined for all pieces', () => {
                expect(GoPiece.DARK.toString()).toBe('GoPiece.DARK');
                expect(GoPiece.LIGHT.toString()).toBe('GoPiece.LIGHT');
                expect(GoPiece.EMPTY.toString()).toBe('GoPiece.EMPTY');
                expect(GoPiece.DEAD_DARK.toString()).toBe('GoPiece.DEAD_DARK');
                expect(GoPiece.DEAD_LIGHT.toString()).toBe('GoPiece.DEAD_LIGHT');
                expect(GoPiece.DARK_TERRITORY.toString()).toBe('GoPiece.DARK_TERRITORY');
                expect(GoPiece.LIGHT_TERRITORY.toString()).toBe('GoPiece.LIGHT_TERRITORY');
            });
        });
        describe('ofPlayer', () => {
            it('should map correctly the normal player', () => {
                expect(GoPiece.ofPlayer(Player.ZERO)).toBe(GoPiece.DARK);
                expect(GoPiece.ofPlayer(Player.ONE)).toBe(GoPiece.LIGHT);
            });
        });
    });
});
