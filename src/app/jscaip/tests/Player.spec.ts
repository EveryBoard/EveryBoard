/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from '../Player';

describe('Player', () => {

    it('should override toString correctly', () => {
        const player: Player = Player.ONE;
        expect(player.toString()).toBe('Player 1');
    });
    it('should define opponent of each player', () => {
        expect(Player.ONE.getOpponent()).toBe(Player.ZERO);
        expect(Player.ZERO.getOpponent()).toBe(Player.ONE);
    });
    it('should have an alternative toString', () => {
        expect(PlayerOrNone.NONE.TO_STRING()).toBe('PLAYER_NONE');
    });
});
