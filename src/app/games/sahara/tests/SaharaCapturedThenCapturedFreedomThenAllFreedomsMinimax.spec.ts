/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { EmptyRulesConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { SaharaCapturedThenCapturedFreedomThenAllFreedomsMinimax } from '../SaharaCapturedThenCapturedFreedomThenAllFreedomsMinimax';
import { SaharaRules } from '../SaharaRules';

describe('SaharaCapturedThenCapturedFreedomThenAllFreedomsMinimax', () => {

    const rules: SaharaRules = SaharaRules.get();
    const minimax: SaharaCapturedThenCapturedFreedomThenAllFreedomsMinimax =
        new SaharaCapturedThenCapturedFreedomThenAllFreedomsMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = SaharaRules.get().getDefaultRulesConfig();

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
