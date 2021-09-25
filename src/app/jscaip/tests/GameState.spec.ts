import { GameState } from '../GameState';

class MyGameState extends GameState {

}

describe('GameState', () => {

    it('should throw when passed null turn', () => {
        expect(() => new MyGameState(null)).toThrowError('Turn cannot be null.');
    });
});
