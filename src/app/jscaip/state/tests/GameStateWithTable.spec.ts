/* eslint-disable max-lines-per-function */
import { TestUtils } from '@everyboard/lib';
import { Coord } from '../../Coord';
import { GameStateWithTable } from '../GameStateWithTable';

class MyGameState extends GameStateWithTable<number> {
}

describe('GameStateWithTable', () => {

    it('should throw when calling getPieceAt with out of board coord', () => {
        const state: MyGameState = new MyGameState([[]], 0);
        TestUtils.expectToThrowAndLog(
            () => state.getPieceAtXY(0, 0),
            'Accessing coord not on board (0, 0).',
        );
    });

    describe('getCoordsAndContents', () => {

        it('should provide a list of {key, value} from left to right then top to bottom', () => {
            // Given an initial board
            const state: MyGameState = new MyGameState([[0, 1], [2, 3]], 0);

            // When rendering to map
            const map: {coord: Coord, content: number}[] = state.getCoordsAndContents();

            // Then it should be ordered
            const expectedMap: {coord: Coord, content: number}[] = [
                { coord: new Coord(0, 0), content: 0 },
                { coord: new Coord(1, 0), content: 1 },
                { coord: new Coord(0, 1), content: 2 },
                { coord: new Coord(1, 1), content: 3 },
            ];
            expect(map).toEqual(expectedMap);
        });
    });

    describe('iterator', () => {
        it('should traverse the element from left to right then top to bottom', () => {
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

    it('should give board dimensions with getWidth and getHeight', () => {
        // Given a state
        const state: MyGameState = new MyGameState([[0, 1, 2], [3, 4, 5]], 0);

        // When accessing its dimensions
        const width: number = state.getWidth();
        const height: number = state.getHeight();

        // Then it should have the expected dimensions
        expect(width).toBe(3);
        expect(height).toBe(2);
    });

});
