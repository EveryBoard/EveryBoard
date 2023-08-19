import { Minimax } from 'src/app/jscaip/Minimax';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { NewGameMove } from '../NewGameMove';
import { NewGameBoardValue, NewGameLegalityInfo, NewGameNode, NewGameRules } from '../NewGameRules';
import { NewGameState } from '../NewGameState';
import { NewGameDummyMinimax } from '../NewGameDummyMinimax';
import { GameConfig } from 'src/app/jscaip/ConfigUtil';

/**
 * This is the test suite for the rules
 */
describe('NewGameRules', () => {

    let rules: NewGameRules;
    let minimaxes: Minimax<NewGameMove,
                           NewGameState,
                           GameConfig,
                           NewGameLegalityInfo,
                           NewGameBoardValue>[]; // TODO NewGameConfig

    beforeEach(() => {
        // This is the rules instance that we will test
        rules = NewGameRules.get();
        // These are the minimaxes. They will be tested at the same time.
        minimaxes = [
            new NewGameDummyMinimax(rules, 'NewGameDummyMinimax'),
        ];
    });
    it('should adhere to some rule', () => {
        // This is how you would test a particular rule:

        // Given a state
        const state: NewGameState = NewGameState.getInitialState();

        // When doing some move
        const move: NewGameMove = new NewGameMove();

        // Then it should succeed (or fail)
        const expectedState: NewGameState = new NewGameState(1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should be a draw', () => {
        // This is how you would test the game status computation:

        // Given some state
        const state: NewGameState = new NewGameState(42);
        // When checking its status
        // Then it should be a draw
        const node: NewGameNode = new NewGameNode(state);
        RulesUtils.expectToBeDraw(rules, node, minimaxes);
        // Or you could use this
        // RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
});
