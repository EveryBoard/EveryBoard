import { Coord } from '../Coord';
import { GameStateWithTable } from '../GameStateWithTable';

class MyGameState extends GameStateWithTable<number> {
}

describe('GameStateWithTable', () => {

    it('should throw when calling getPieceAt with out of board coord', () => {
        const state: MyGameState = new MyGameState([[]], 0);
        expect(() => state.getPieceAt(new Coord(0, 0))).toThrowError('Accessing coord not on board (0, 0).');
    });
});
