import { GameStatus } from '../GameStatus';
import { Player } from '../Player';

describe('GameStatus', () => {
    it('should be convertible to BoardValue', () => {
        expect(GameStatus.ZERO_WON.toBoardValue().value[0]).toBe(Player.ZERO.getVictoryValue());
        expect(GameStatus.ONE_WON.toBoardValue().value[0]).toBe(Player.ONE.getVictoryValue());
        expect(GameStatus.DRAW.toBoardValue().value[0]).toBe(0);
        expect(GameStatus.ONGOING.toBoardValue().value[0]).toBe(0);
    });
});
