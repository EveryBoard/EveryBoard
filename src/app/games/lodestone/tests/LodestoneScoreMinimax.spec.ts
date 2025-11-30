/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { LodestoneRules } from '../LodestoneRules';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { LodestoneScoreMinimax } from '../LodestoneScoreMinimax';
import { NoConfig } from '../../../jscaip/RulesConfigUtil';

describe('LodestoneScoreMinimax', () => {

    const rules: LodestoneRules = LodestoneRules.get();
    const minimax: LodestoneScoreMinimax = new LodestoneScoreMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: NoConfig = LodestoneRules.get().getDefaultRulesConfig();

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
