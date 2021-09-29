import { GameState } from '../GameState';

class MyGameState extends GameState<unknown, unknown> {

    public getNullable(coord: unknown): unknown {
        throw new Error('Method not implemented.');
    }
    public getBoardAt(coord: unknown): unknown {
        throw new Error('Method not implemented.');
    }
}

describe('GameState', () => {

    it('should throw when passed null turn', () => {
        expect(() => new MyGameState(null)).toThrowError('Turn cannot be null.');
    });
});
