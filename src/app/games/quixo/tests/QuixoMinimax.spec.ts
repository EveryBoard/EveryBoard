/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { QuixoMinimax } from '../QuixoMinimax';
import { QuixoRules } from '../QuixoRules';
import { QuixoConfig } from '../QuixoState';

describe('QuixoMinimax', () => {

    const rules: QuixoRules = QuixoRules.get();
    const minimax: QuixoMinimax = new QuixoMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: MGPOptional<QuixoConfig> = QuixoRules.get().getDefaultRulesConfig();

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
