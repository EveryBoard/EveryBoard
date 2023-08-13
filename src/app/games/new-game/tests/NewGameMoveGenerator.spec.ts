import { NewGameMove } from '../NewGameMove';
import { NewGameMoveGenerator } from '../NewGameMoveGenerator';
import { NewGameNode } from '../NewGameRules';
import { NewGameState } from '../NewGameState';

/**
 * These are the tests for the move generator.
 * We want to test that it gives us the expected moves.
 * Typically, this can be done by checking the number of moves available on the first turn of a game.
 */
describe('NewGameMoveGenerator', () => {

    let moveGenerator: NewGameMoveGenerator;

    beforeEach(() => {
        moveGenerator = new NewGameMoveGenerator();
    });
    it('should have all move options', () => {
        // Given an initial node
        const initialState: NewGameState = NewGameState.getInitialState();
        const node: NewGameNode = new NewGameNode(initialState);

        // When computing the list of moves
        const moves: NewGameMove[] = moveGenerator.getListMoves(node);

        // Then there should be this many moves
        expect(moves.length).toBe(0);
    });
});
