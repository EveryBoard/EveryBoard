import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { NoConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { DiamDummyMinimax } from '../DiamDummyMinimax';
import { DiamRules } from '../DiamRules';

/* eslint-disable max-lines-per-function */

describe('DiamDummyMinimax', () => {

    const rules: DiamRules = DiamRules.get();
    const minimax: DiamDummyMinimax = new DiamDummyMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: NoConfig = DiamRules.get().getDefaultRulesConfig();

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
