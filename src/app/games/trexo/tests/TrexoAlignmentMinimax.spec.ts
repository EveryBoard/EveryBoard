/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { TrexoRules } from '../TrexoRules';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { TrexoAlignmentMinimax } from '../TrexoAlignmentMinimax';
import { NoConfig } from '../../../jscaip/RulesConfigUtil';

describe('TrexoAlignmentMinimax', () => {

    const rules: TrexoRules = TrexoRules.get();
    const minimax: TrexoAlignmentMinimax = new TrexoAlignmentMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: NoConfig = TrexoRules.get().getDefaultRulesConfig();

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
