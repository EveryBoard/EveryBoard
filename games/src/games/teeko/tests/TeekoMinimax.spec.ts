/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { TeekoHeuristic } from '../TeekoHeuristic';
import { TeekoMove } from '../TeekoMove';
import { TeekoMoveGenerator } from '../TeekoMoveGenerator';
import { TeekoConfig, TeekoRules } from '../TeekoRules';
import { TeekoState } from '../TeekoState';
import { minimaxTest, SlowTest } from '../utils/tests/TestUtils.spec';

class TeekoMinimax extends Minimax<TeekoMove, TeekoState, TeekoConfig> {
    public constructor() {
        super('Minimax', TeekoRules.get(), new TeekoHeuristic(), new TeekoMoveGenerator());
    }
}

describe('TeekoMinimax', () => {

    const rules: TeekoRules = TeekoRules.get();
    const minimax: TeekoMinimax = new TeekoMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: TeekoConfig = TeekoRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not always a finisher
        });
    });

});
