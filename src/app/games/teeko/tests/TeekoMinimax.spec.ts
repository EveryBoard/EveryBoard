/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { TeekoConfig, TeekoRules } from '../TeekoRules';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { TeekoMinimax } from '../TeekoMinimax';

describe('TeekoMinimax', () => {

    const rules: TeekoRules = TeekoRules.get();
    const minimax: TeekoMinimax = new TeekoMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: MGPOptional<TeekoConfig> = TeekoRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not always a finisher
        });
    });

});
