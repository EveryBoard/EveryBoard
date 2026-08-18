/* eslint-disable max-lines-per-function */
import { EmptyRulesConfig } from '../../../config/RulesConfigUtil';
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { SaharaMobilityHeuristic } from '../SaharaMobilityHeuristic';
import { SaharaMove } from '../SaharaMove';
import { SaharaMoveGenerator } from '../SaharaMoveGenerator';
import { SaharaRules } from '../SaharaRules';
import { SaharaState } from '../SaharaState';
import { minimaxTest, SlowTest } from '../utils/tests/TestUtils.spec';

class SaharaMobilityMinimax extends Minimax<SaharaMove, SaharaState> {
    public constructor() {
        super('Mobility', SaharaRules.get(), new SaharaMobilityHeuristic(SaharaRules.get()), new SaharaMoveGenerator());
    }
}

describe('SaharaMobilityMinimax', () => {

    const rules: SaharaRules = SaharaRules.get();
    const minimax: SaharaMobilityMinimax = new SaharaMobilityMinimax();
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
