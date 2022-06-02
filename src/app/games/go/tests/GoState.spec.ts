/* eslint-disable max-lines-per-function */
import { Player } from 'src/app/jscaip/Player';
import { GoPiece } from '../GoState';

describe('GoState', () => {

    describe('GoPiece', () => {
        describe('GoPiece.ofPlayer', () => {
            it('should map correctly the normal player', () => {
                expect(GoPiece.ofPlayer(Player.ZERO)).toBe(GoPiece.DARK);
                expect(GoPiece.ofPlayer(Player.ONE)).toBe(GoPiece.LIGHT);
            });
        });
    });
});
