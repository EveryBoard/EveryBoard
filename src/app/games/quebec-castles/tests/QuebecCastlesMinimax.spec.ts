import { MGPOptional } from '@everyboard/lib';

import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { QuebecCastlesMinimax } from '../QuebecCastlesMinimax';
import { QuebecCastlesMove } from '../QuebecCastlesMove';
import { QuebecCastlesConfig, QuebecCastlesNode, QuebecCastlesRules } from '../QuebecCastlesRules';
import { QuebecCastlesState } from '../QuebecCastlesState';

describe('QuebecCastlesMinimax', () => {

    let minimax: Minimax<QuebecCastlesMove, QuebecCastlesState, QuebecCastlesConfig>;
    const defaultConfig: QuebecCastlesConfig = QuebecCastlesRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        minimax = new QuebecCastlesMinimax();
    });

    it('should select some move', () => {
        // Given state
        const state: QuebecCastlesState = QuebecCastlesRules.get().getInitialState(defaultConfig);
        const node: QuebecCastlesNode = new QuebecCastlesNode(state);

        // When selecting the best move
        const bestMove: QuebecCastlesMove = minimax.chooseNextMove(node, { name: 'Level 1', maxDepth: 1 }, defaultConfig);
        // Then it should be the move I want it to be
        expect(bestMove).toBeTruthy();
    });

    SlowTest.it('should be able play against itself', () => {
        // This is a test that makes the minimax play against itself. It is "slow" and will not run locally then.
        const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
        minimaxTest({
            rules: QuebecCastlesRules.get(),
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false,
        });
    });

});
