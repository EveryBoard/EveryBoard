import { Coord } from '../Coord';
import { GamePartSlice } from '../GamePartSlice';

class MyGamePartSlice extends GamePartSlice {

}

describe('GamePartSlice', () => {
    it('should throw when passed null board', () => {
        expect(() => new MyGamePartSlice(null, 0)).toThrowError('Board cannot be null.');
    });
    it('should throw when passed null turn', () => {
        expect(() => new MyGamePartSlice([], null)).toThrowError('Turn cannot be null.');
    });
    it('should throw when calling getBoardAt with out of board coord', () => {
        const state: MyGamePartSlice = new MyGamePartSlice([[]], 0);
        expect(() => state.getBoardAt(new Coord(0, 0))).toThrowError('Out of range coord: (0, 0).');
    });
});
