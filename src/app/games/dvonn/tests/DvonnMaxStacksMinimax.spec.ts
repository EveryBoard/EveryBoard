/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { EmptyRulesConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { DvonnMaxStacksMinimax } from '../DvonnMaxStacksMinimax';
import { DvonnRules } from '../DvonnRules';

describe('DvonnMaxStacksMinimax', () => {

    const rules: DvonnRules = DvonnRules.get();
    const minimax: DvonnMaxStacksMinimax = new DvonnMaxStacksMinimax();
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
