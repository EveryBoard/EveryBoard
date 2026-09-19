/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { CoerceoCapturesAndFreedomHeuristic } from '../CoerceoCapturesAndFreedomHeuristic';
import { CoerceoMove } from '../CoerceoMove';
import { CoerceoOrderedMoveGenerator } from '../CoerceoOrderedMoveGenerator';
import { CoerceoConfig, CoerceoRules } from '../CoerceoRules';
import { CoerceoState } from '../CoerceoState';
import { minimaxTest, SlowTest } from '../utils/tests/TestUtils.spec';

class CoerceoCapturesAndFreedomMinimax extends Minimax<CoerceoMove, CoerceoState, CoerceoConfig> {
    public constructor() {
        super('Captures > Freedom', CoerceoRules.get(), new CoerceoCapturesAndFreedomHeuristic(), new CoerceoOrderedMoveGenerator());
    }
}

describe('CoerceoCapturesAndFreedomMinimax', () => {

    const rules: CoerceoRules = CoerceoRules.get();
    const minimax: CoerceoCapturesAndFreedomMinimax = new CoerceoCapturesAndFreedomMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: CoerceoConfig = CoerceoRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not a finisher
        });
    });

});
