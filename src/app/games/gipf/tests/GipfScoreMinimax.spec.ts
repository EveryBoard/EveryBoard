/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { GipfRules } from '../GipfRules';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { GipfScoreMinimax } from '../GipfScoreMinimax';
import { NoConfig } from '../../../jscaip/RulesConfigUtil';

describe('GipfScoreMinimax', () => {

    const rules: GipfRules = GipfRules.get();
    const minimax: GipfScoreMinimax = new GipfScoreMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: NoConfig = GipfRules.get().getDefaultRulesConfig();

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
