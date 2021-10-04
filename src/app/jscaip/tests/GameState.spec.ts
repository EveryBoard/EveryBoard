import { AbstractGameState } from '../GameState';

class MyGameState extends AbstractGameState {

    public isOnBoard(coord: unknown): boolean {
        throw new Error('Method not implemented.');
    }
    public getNullable(coord: unknown): unknown {
        throw new Error('Method not implemented.');
    }
    public getBoardAt(coord: unknown): unknown {
        throw new Error('Method not implemented.');
    }
    public setAtUnsafe(coord: unknown, v: unknown): this {
        throw new Error('Method not implemented.');
    }
}

describe('GameState', () => {

    it('should throw when passed null turn', () => {
        expect(() => new MyGameState(null)).toThrowError('Turn cannot be null.');
    });
});
