/* eslint-disable max-lines-per-function */
import { EmptyRulesConfig } from '../../../config/RulesConfig';
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { LinesOfActionHeuristic } from '../LinesOfActionHeuristic';
import { LinesOfActionMove } from '../LinesOfActionMove';
import { LinesOfActionMoveGenerator } from '../LinesOfActionMoveGenerator';
import { LinesOfActionRules } from '../LinesOfActionRules';
import { LinesOfActionState } from '../LinesOfActionState';
import { minimaxTest, SlowTest } from '../utils/tests/TestUtils.spec';

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
