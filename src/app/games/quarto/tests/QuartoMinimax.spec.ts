/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from 'src/app/jscaip/AI/AI';
import { QuartoRules } from '../QuartoRules';
import { minimaxTest, SlowTest } from 'src/app/utils/tests/TestUtils.spec';
import { QuartoMinimax } from '../QuartoMinimax';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('QuartoMinimax', () => {

    const rules: QuartoRules = QuartoRules.get();
    const minimax: QuartoMinimax = new QuartoMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: NoConfig = QuartoRules.get().getDefaultRulesConfig();

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
