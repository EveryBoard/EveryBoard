/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { ApagosMove } from '../ApagosMove';
import { ApagosMoveGenerator } from '../ApagosMoveGenerator';
import { ApagosRightmostHeuristic } from '../ApagosRightmostHeuristic';
import { ApagosConfig, ApagosRules } from '../ApagosRules';
import { ApagosState } from '../ApagosState';

class ApagosRightmostMinimax extends Minimax<ApagosMove, ApagosState, ApagosConfig> {
    public constructor() {
        super('Rightmost Focus', ApagosRules.get(), new ApagosRightmostHeuristic(), new ApagosMoveGenerator());
    }
}

describe('ApagosRightmostMinimax', () => {

    const rules: ApagosRules = ApagosRules.get();
    const minimax: ApagosRightmostMinimax = new ApagosRightmostMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: ApagosConfig = ApagosRules.get().getDefaultRulesConfig();

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
