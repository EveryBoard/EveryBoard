/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { NoConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { SaharaFreedomMinimax } from '../SaharaMinimax';
import { SaharaRules } from '../SaharaRules';

describe('SaharaFreedomMinimax', () => {

    const rules: SaharaRules = SaharaRules.get();
    const minimax: SaharaFreedomMinimax = new SaharaFreedomMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: NoConfig = SaharaRules.get().getDefaultRulesConfig();

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
