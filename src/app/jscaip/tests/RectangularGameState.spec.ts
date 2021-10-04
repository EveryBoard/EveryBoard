import { Coord } from '../Coord';
import { RectangularGameState } from '../RectangularGameState';

class MyGameState extends RectangularGameState<number> {
    public setAtUnsafe(coord: Coord, v: number): this {
        throw new Error('Method was useless back then.');
    }
}

describe('GameState', () => {
    it('should throw when passed null board', () => {
        expect(() => new MyGameState(null, 0)).toThrowError('Board cannot be null.');
    });
    it('should throw when calling getBoardAt with out of board coord', () => {
        const state: MyGameState = new MyGameState([[]], 0);
        expect(() => state.getBoardAt(new Coord(0, 0))).toThrowError('Out of range coord: (0, 0).');
    });
});
