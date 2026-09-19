import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { EmptyRulesConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { NewGameHeuristic } from '../NewGameHeuristic';
import { NewGameMove } from '../NewGameMove';
import { NewGameMoveGenerator } from '../NewGameMoveGenerator';
import { NewGameLegalityInfo, NewGameNode, NewGameRules } from '../NewGameRules';
import { NewGameState } from '../NewGameState';

/**
 * These are the tests for the minimax.
 * We want to test that it selects a certain move on a specific board.
 * Note that most minimax tests should actually be heuristic tests, so use these tests sparingly.
 */

class NewGameMinimax extends Minimax<NewGameMove, NewGameState, EmptyRulesConfig, NewGameLegalityInfo> {

    public constructor() {
        super('Dummy',
              NewGameRules.get(),
              new NewGameHeuristic(), // Or "new DummyHeuristic()" if you did not create NewGameHeuristic
              new NewGameMoveGenerator(),
        );
    }
}

describe('NewGameMinimax', () => {

    let minimax: Minimax<NewGameMove, NewGameState, EmptyRulesConfig, NewGameLegalityInfo>;
    const defaultConfig: EmptyRulesConfig = NewGameRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        minimax = new NewGameMinimax();
    });

    it('should select some move', () => {
        // Given state
        const state: NewGameState = NewGameRules.get().getInitialState(defaultConfig);
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
