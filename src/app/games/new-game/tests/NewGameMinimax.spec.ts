import { NewGameState } from '../NewGameState';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { NewGameMove } from '../NewGameMove';
import { NewGameLegalityInfo, NewGameNode, NewGameRules } from '../NewGameRules';
import { NewGameMinimax } from '../NewGameMinimax';
import { EmptyRulesConfig, NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI/AI';
import { minimaxTest, SlowTest } from 'src/app/utils/tests/TestUtils.spec';

/**
 * These are the tests for the minimax.
 * We want to test that it selects a certain move on a specific board.
 */
describe('NewGameMinimax', () => {

    let minimax: Minimax<NewGameMove, NewGameState, EmptyRulesConfig, NewGameLegalityInfo>;
    const defaultConfig: NoConfig = NewGameRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        minimax = new NewGameMinimax();
    });

    it('should select some move', () => {
        // Given state
        const state: NewGameState = NewGameRules.get().getInitialState();
        const node: NewGameNode = new NewGameNode(state);

        // When selecting the best move
        const bestMove: NewGameMove = minimax.chooseNextMove(node, { name: 'Level 1', maxDepth: 1 }, defaultConfig);
        // Then it should be the move I want it to be
        expect(bestMove).toBeTruthy();
    });

    SlowTest.it('should be able play against itself', () => {
        // This is a test that makes the minimax play against itself. It is "slow" and will not run locally then.
        const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
        minimaxTest({
            rules: NewGameRules.get(),
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false,
        });
    });

});
