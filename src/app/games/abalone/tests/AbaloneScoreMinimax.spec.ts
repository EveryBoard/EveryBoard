/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { AbaloneConfig, AbaloneRules } from '../AbaloneRules';
import { AbaloneScoreMinimax } from '../AbaloneScoreMinimax';

describe('AbaloneScoreMinimax', () => {

    const rules: AbaloneRules = AbaloneRules.get();
    const minimax: AbaloneScoreMinimax = new AbaloneScoreMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: AbaloneConfig = AbaloneRules.get().getDefaultRulesConfig();

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
