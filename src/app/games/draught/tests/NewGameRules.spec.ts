import { Minimax } from 'src/app/jscaip/Minimax';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { DraughtMove } from '../DraughtMove';
import { NewGameBoardValue, NewGameLegalityInfo, NewGameNode, DraughtRules } from '../DraughtRules';
import { DraughtState } from '../DraughtState';
import { DraughtDummyMinimax } from '../DraughtDummyMinimax';

/**
 * This is the test suite for the rules
 */
describe('NewGameRules', () => {

    let rules: DraughtRules;
    let minimaxes: Minimax<DraughtMove, DraughtState, NewGameLegalityInfo, NewGameBoardValue>[];

    beforeEach(() => {
        // This is the rules instance that we will test
        rules = DraughtRules.get();
        // These are the minimaxes. They will be tested at the same time.
        minimaxes = [
            new DraughtDummyMinimax(rules, 'NewGameDummyMinimax'),
        ];
    });
    it('should adhere to some rule', () => {
        // This is how you would test a particular rule:

        // Given a state
        const state: DraughtState = DraughtState.getInitialState();

        // When doing some move
        const move: DraughtMove = new DraughtMove();

        // Then it should succeed (or fail)
        const expectedState: DraughtState = new DraughtState(1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should be a draw', () => {
        // This is how you would test the game status computation:

        // Given some state
        const state: DraughtState = new DraughtState(42);
        // When checking its status
        // Then it should be a draw
        const node: NewGameNode = new NewGameNode(state);
        RulesUtils.expectToBeDraw(rules, node, minimaxes);
        // Or you could use this
        // RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
});
