import { AbstractGameState } from '../GameState';

class MyGameState extends AbstractGameState {

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
