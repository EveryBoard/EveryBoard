/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '@everyboard/games';
import { Minimax } from '@everyboard/games';

import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { SquarzHeuristic } from '../SquarzHeuristic';
import { SquarzMove } from '../SquarzMove';
import { SquarzMoveGenerator } from '../SquarzMoveGenerator';
import { SquarzConfig, SquarzRules } from '../SquarzRules';
import { SquarzState } from '../SquarzState';

class SquarzMinimax extends Minimax<SquarzMove, SquarzState, SquarzConfig> {
    public constructor() {
        const rules: SquarzRules = SquarzRules.get();
        super('Score', rules, new SquarzHeuristic(), new SquarzMoveGenerator(rules));
    }
}

describe('SquarzMinimax', () => {

    const rules: SquarzRules = SquarzRules.get();
    const minimax: SquarzMinimax = new SquarzMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: SquarzConfig = SquarzRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: true,
        });
    });

});
