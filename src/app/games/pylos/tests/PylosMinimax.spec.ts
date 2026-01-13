/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { PylosRules } from '../PylosRules';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { PylosMinimax } from '../PylosMinimax';
import { NoConfig } from '../../../jscaip/RulesConfigUtil';

describe('PylosMinimax', () => {

    const rules: PylosRules = PylosRules.get();
    const minimax: PylosMinimax = new PylosMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: NoConfig = PylosRules.get().getDefaultRulesConfig();

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
