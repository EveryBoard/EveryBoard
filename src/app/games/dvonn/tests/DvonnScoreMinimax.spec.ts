/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { EmptyRulesConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { DvonnMove } from '../DvonnMove';
import { DvonnMoveGenerator } from '../DvonnMoveGenerator';
import { DvonnRules } from '../DvonnRules';
import { DvonnScoreHeuristic } from '../DvonnScoreHeuristic';
import { DvonnState } from '../DvonnState';

class DvonnScoreMinimax extends Minimax<DvonnMove, DvonnState> {

    public constructor() {
        super($localize`Score`,
              DvonnRules.get(),
              new DvonnScoreHeuristic(),
              new DvonnMoveGenerator());
    }

}

describe('DvonnScoreMinimax', () => {

    const rules: DvonnRules = DvonnRules.get();
    const minimax: DvonnScoreMinimax = new DvonnScoreMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = DvonnRules.get().getDefaultRulesConfig();

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
