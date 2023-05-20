import { GameStatus } from '../GameStatus';
import { Player } from '../Player';

describe('GameStatus', () => {
    it('should be convertible to BoardValue', () => {
        expect(GameStatus.ZERO_WON.toBoardValue().value).toBe(Player.ZERO.getVictoryValue());
        expect(GameStatus.ONE_WON.toBoardValue().value).toBe(Player.ONE.getVictoryValue());
        expect(GameStatus.DRAW.toBoardValue().value).toBe(0);
        expect(GameStatus.ONGOING.toBoardValue().value).toBe(0);
    });
});
