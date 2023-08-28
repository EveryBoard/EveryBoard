import { NewGameState } from '../NewGameState';
import { DummyHeuristic, Minimax } from 'src/app/jscaip/Minimax';
import { NewGameMove } from '../NewGameMove';
import { NewGameMoveGenerator } from '../NewGameMoveGenerator';
import { NewGameLegalityInfo, NewGameNode, NewGameRules } from '../NewGameRules';

/**
 * These are the tests for the minimax.
 * We want to test that it selects a certain move on a specific board.
 */
describe('NewGameMinimax', () => {

    let minimax: Minimax<NewGameMove, NewGameState, NewGameLegalityInfo>;

    beforeEach(() => {
        minimax = new Minimax('Dummy', NewGameRules.get(), new DummyHeuristic(), new NewGameMoveGenerator());
    });
    it('should select some move', () => {
        // Given state
        const state: NewGameState = NewGameState.getInitialState();
        const node: NewGameNode = new NewGameNode(state);

        // When selecting the best move
        const bestMove: NewGameMove = minimax.chooseNextMove(node, { name: 'Level 1', maxDepth: 1 });
        // Then it should be the move I want it to be
        expect(bestMove).toBeTruthy();
    });
});
