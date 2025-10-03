/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../../app/jscaip/AI/AI';
import { DvonnRules } from '../DvonnRules';
import { minimaxTest, SlowTest } from '../../../../app/utils/tests/TestUtils.spec';
import { DvonnScoreMinimax } from '../DvonnScoreMinimax';
import { NoConfig } from '../../../../app/jscaip/RulesConfigUtil';

describe('DvonnScoreMinimax', () => {

    const rules: DvonnRules = DvonnRules.get();
    const minimax: DvonnScoreMinimax = new DvonnScoreMinimax();
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
