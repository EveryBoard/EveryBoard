import { Comparable } from 'src/app/utils/Comparable';
import { AbstractGameState } from '../GameState';

class MyGameState extends AbstractGameState {

    public getPieceAt(coord: Comparable): Comparable {
        throw new Error('Method not implemented.');
    }
    public isOnBoard(coord: Comparable): boolean {
        throw new Error('Method not implemented.');
    }
    public getNullable(coord: Comparable): Comparable {
        throw new Error('Method not implemented.');
    }
}

describe('GameState', () => {

    it('should throw when passed null turn', () => {
        expect(() => new MyGameState(null)).toThrowError('Turn cannot be null.');
    });
});
