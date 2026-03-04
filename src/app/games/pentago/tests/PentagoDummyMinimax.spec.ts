/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { NoConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { PentagoDummyMinimax } from '../PentagoDummyMinimax';
import { PentagoRules } from '../PentagoRules';

describe('PentagoDummyMinimax', () => {

    const rules: PentagoRules = PentagoRules.get();
    const minimax: PentagoDummyMinimax = new PentagoDummyMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: NoConfig = PentagoRules.get().getDefaultRulesConfig();

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
