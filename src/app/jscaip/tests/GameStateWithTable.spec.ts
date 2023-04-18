/* eslint-disable max-lines-per-function */
import { Coord } from '../Coord';
import { GameStateWithTable } from '../GameStateWithTable';

class MyGameState extends GameStateWithTable<number> {
}

describe('GameStateWithTable', () => {

    it('should throw when calling getPieceAt with out of board coord', () => {
        const state: MyGameState = new MyGameState([[]], 0);
        expect(() => state.getPieceAt(new Coord(0, 0))).toThrowError('Accessing coord not on board (0, 0).');
    });

    describe('toMap', () => {
        it('should provide a list of {key, value} from left to right then top to bottom', () => {
            // Given an initial board
            const state: MyGameState = new MyGameState([[0, 1], [2, 3]], 0);

            // When rendering to map
            const map: {key: Coord, value: number}[]= state.toMap();

            // Then it should be ordered
            const expectedMap: {key: Coord, value: number}[]= [
                { key: new Coord(0, 0), value: 0 },
                { key: new Coord(1, 0), value: 1 },
                { key: new Coord(0, 1), value: 2 },
                { key: new Coord(1, 1), value: 3 },
            ];
            expect(map).toEqual(expectedMap);
        });
    });
    describe('iterator', () => {
        it('should travel the element for left to right then top to bottom', () => {
            // Given an initial board
            const state: MyGameState = new MyGameState([[0, 1], [2, 3]], 0);

            // When looping over it and queuing the element
            const values: number[] = [];
            for (const value of state) {
                values.push(value);
            }

            // Then it should be ordered
            expect(values).toEqual([0, 1, 2, 3]);
        });
    });
});
