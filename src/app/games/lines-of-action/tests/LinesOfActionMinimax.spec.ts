/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '@everyboard/games';
import { Minimax } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';

import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { LinesOfActionHeuristic } from '../LinesOfActionHeuristic';
import { LinesOfActionMove } from '../LinesOfActionMove';
import { LinesOfActionMoveGenerator } from '../LinesOfActionMoveGenerator';
import { LinesOfActionRules } from '../LinesOfActionRules';
import { LinesOfActionState } from '../LinesOfActionState';

class LinesOfActionMinimax extends Minimax<LinesOfActionMove, LinesOfActionState> {
    public constructor() {
        super('Minimax', LinesOfActionRules.get(), new LinesOfActionHeuristic(), new LinesOfActionMoveGenerator());
    }
}

describe('LinesOfActionMinimax', () => {

    const rules: LinesOfActionRules = LinesOfActionRules.get();
    const minimax: LinesOfActionMinimax = new LinesOfActionMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = LinesOfActionRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not a finisher
        });
    });

});
