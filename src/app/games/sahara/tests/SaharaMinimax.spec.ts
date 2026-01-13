/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { SaharaRules } from '../SaharaRules';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { SaharaMinimax } from '../SaharaMinimax';
import { NoConfig } from '../../../jscaip/RulesConfigUtil';

describe('SaharaMinimax', () => {

    const rules: SaharaRules = SaharaRules.get();
    const minimax: SaharaMinimax = new SaharaMinimax();
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
