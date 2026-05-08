/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { ApagosFullBoardMinimax } from '../ApagosFullBoardMinimax';
import { ApagosConfig, ApagosRules } from '../ApagosRules';

describe('ApagosFullBoardMinimax', () => {

    const rules: ApagosRules = ApagosRules.get();
    const minimax: ApagosFullBoardMinimax = new ApagosFullBoardMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: ApagosConfig = ApagosRules.get().getDefaultRulesConfig();

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
