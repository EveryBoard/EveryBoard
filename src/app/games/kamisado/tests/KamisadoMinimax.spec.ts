/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { KamisadoRules } from '../KamisadoRules';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { KamisadoMinimax } from '../KamisadoMinimax';
import { NoConfig } from '../../../jscaip/RulesConfigUtil';

describe('KamisadoMinimax', () => {

    const rules: KamisadoRules = KamisadoRules.get();
    const minimax: KamisadoMinimax = new KamisadoMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: NoConfig = KamisadoRules.get().getDefaultRulesConfig();

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
