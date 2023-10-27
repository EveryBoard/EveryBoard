import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { DraughtDummyMinimax } from '../DraughtDummyMinimax';
import { DraughtMove } from '../DraughtMove';
import { NewGameNode, DraughtRules } from '../DraughtRules';
import { DraughtState } from '../DraughtState';

/**
 * These are the tests for the minimax.
 * We want to test two things: the list of possible moves and the scoring function.
 */
describe('NewGameDummyMinimax', () => {

    let minimax: DraughtDummyMinimax;

    beforeEach(() => {
        minimax = new DraughtDummyMinimax(DraughtRules.get(), 'NewGameDummyMinimax');
    });
    it('should have all move options', () => {
        // Given an initial node
        const initialState: DraughtState = DraughtState.getInitialState();
        const node: NewGameNode = new NewGameNode(initialState);

        // When computing the list of moves
        const moves: DraughtMove[] = minimax.getListMoves(node);

        // Then there should be this many moves
        expect(moves.length).toBe(0);
    });
    it('should have some score', () => {
        /**
         * To test scores, most of the time you want to rely on `RulesUtils.expectSecondStateToBeBetterThanFirstFor`.
         */
        const initialState: DraughtState = DraughtState.getInitialState();
        RulesUtils.expectStatesToBeOfEqualValue(minimax, initialState, initialState);
    });
});
