/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { SquarzMinimax } from '../SquarzMinimax';
import { SquarzConfig, SquarzRules } from '../SquarzRules';

describe('SquarzMinimax', () => {

    const rules: SquarzRules = SquarzRules.get();
    const minimax: SquarzMinimax = new SquarzMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: SquarzConfig = SquarzRules.get().getDefaultRulesConfig();

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
