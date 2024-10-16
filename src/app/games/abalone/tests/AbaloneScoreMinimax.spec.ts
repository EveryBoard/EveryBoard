/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from 'src/app/jscaip/AI/AI';
import { AbaloneRules } from '../AbaloneRules';
import { minimaxTest, SlowTest } from 'src/app/utils/tests/TestUtils.spec';
import { AbaloneScoreMinimax } from '../AbaloneScoreMinimax';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('AbaloneScoreMinimax', () => {

    const rules: AbaloneRules = AbaloneRules.get();
    const minimax: AbaloneScoreMinimax = new AbaloneScoreMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: NoConfig = AbaloneRules.get().getDefaultRulesConfig();

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
