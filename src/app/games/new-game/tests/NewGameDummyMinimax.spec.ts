import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { NewGameDummyMinimax } from '../NewGameDummyMinimax';
import { NewGameMove } from '../NewGameMove';
import { NewGameNode, NewGameRules } from '../NewGameRules';
import { NewGameState } from '../NewGameState';

/**
 * These are the tests for the minimax.
 * We want to test two things: the list of possible moves and the scoring function.
 */
describe('NewGameDummyMinimax', () => {

    let minimax: NewGameDummyMinimax;

    beforeEach(() => {
        minimax = new NewGameDummyMinimax(NewGameRules.get(), 'NewGameDummyMinimax');
    });
    it('should have all move options', () => {
        // Given an initial node
        const initialState: NewGameState = NewGameState.getInitialState();
        const node: NewGameNode = new NewGameNode(initialState);

        // When computing the list of moves
        const moves: NewGameMove[] = minimax.getListMoves(node);

        // Then there should be this many moves
        expect(moves.length).toBe(0);
    });
    it('should have some score', () => {
        /**
         * To test scores, most of the time you want to rely on `RulesUtils.expectSecondStateToBeBetterThanFirstFor`.
         */
        const initialState: NewGameState = NewGameState.getInitialState();
        RulesUtils.expectStatesToBeOfEqualValue(minimax, initialState, initialState);
    });
});
