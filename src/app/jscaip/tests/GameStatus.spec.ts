import { GameStatus } from '../GameStatus';
import { Player } from '../Player';

describe('GameStatus', () => {

    it('should be convertible to BoardValue', () => {
        expect(GameStatus.ZERO_WON.toBoardValue().metrics).toEqual([Player.ZERO.getVictoryValue()]);
        expect(GameStatus.ONE_WON.toBoardValue().metrics).toEqual([Player.ONE.getVictoryValue()]);
        expect(GameStatus.DRAW.toBoardValue().metrics).toEqual([0]);
        expect(GameStatus.ONGOING.toBoardValue().metrics).toEqual([0]);
    });

});
