/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { EmptyRulesConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { SaharaFreedomHeuristic } from '../SaharaFreedomHeuristic';
import { SaharaMove } from '../SaharaMove';
import { SaharaMoveGenerator } from '../SaharaMoveGenerator';
import { SaharaRules } from '../SaharaRules';
import { SaharaState } from '../SaharaState';

class SaharaFreedomMinimax extends Minimax<SaharaMove, SaharaState> {
    public constructor() {
        super('Freedom', SaharaRules.get(), new SaharaFreedomHeuristic(), new SaharaMoveGenerator());
    }
}

describe('SaharaFreedomMinimax', () => {

    const rules: SaharaRules = SaharaRules.get();
    const minimax: SaharaFreedomMinimax = new SaharaFreedomMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = SaharaRules.get().getDefaultRulesConfig();

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
