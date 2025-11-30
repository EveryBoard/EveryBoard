/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { DvonnRules } from '../DvonnRules';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { DvonnMaxStacksMinimax } from '../DvonnMaxStacksMinimax';
import { NoConfig } from '../../../jscaip/RulesConfigUtil';

describe('DvonnMaxStacksMinimax', () => {

    const rules: DvonnRules = DvonnRules.get();
    const minimax: DvonnMaxStacksMinimax = new DvonnMaxStacksMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: NoConfig = DvonnRules.get().getDefaultRulesConfig();

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
