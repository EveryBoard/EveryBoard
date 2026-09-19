/* eslint-disable max-lines-per-function */
import { EmptyRulesConfig } from '../../../config/RulesConfig';
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { GipfMove } from '../GipfMove';
import { GipfMoveGenerator } from '../GipfMoveGenerator';
import { GipfRules } from '../GipfRules';
import { GipfLegalityInformation } from '../GipfRules';
import { GipfScoreHeuristic } from '../GipfScoreHeuristic';
import { GipfState } from '../GipfState';
import { minimaxTest, SlowTest } from '../utils/tests/TestUtils.spec';

class GipfScoreMinimax extends Minimax<GipfMove, GipfState, EmptyRulesConfig, GipfLegalityInformation> {
    public constructor() {
        super('Score', GipfRules.get(), new GipfScoreHeuristic(), new GipfMoveGenerator());
    }
}

describe('GipfScoreMinimax', () => {

    const rules: GipfRules = GipfRules.get();
    const minimax: GipfScoreMinimax = new GipfScoreMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = GipfRules.get().getDefaultRulesConfig();

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
