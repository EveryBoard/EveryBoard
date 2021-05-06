import { Player } from '../Player';

describe('Player', () => {
    it('Should override toString correctly', () => {
        const player: Player = Player.ONE;
        expect(player.toString()).toBe('Player 1');
    });
});
