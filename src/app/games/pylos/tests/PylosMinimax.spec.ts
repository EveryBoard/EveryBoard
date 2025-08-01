/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../../app/jscaip/AI/AI';
import { PylosRules } from '../PylosRules';
import { minimaxTest, SlowTest } from '../../../../app/utils/tests/TestUtils.spec';
import { PylosMinimax } from '../PylosMinimax';
import { NoConfig } from '../../../../app/jscaip/RulesConfigUtil';

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
