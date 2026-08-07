/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { EmptyRulesConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { GipfMove } from '../GipfMove';
import { GipfMoveGenerator } from '../GipfMoveGenerator';
import { GipfRules } from '../GipfRules';
import { GipfLegalityInformation } from '../GipfRules';
import { GipfScoreHeuristic } from '../GipfScoreHeuristic';
import { GipfState } from '../GipfState';

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
