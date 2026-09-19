/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { EmptyRulesConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { LodestoneMove } from '../LodestoneMove';
import { LodestoneMoveGenerator } from '../LodestoneMoveGenerator';
import { LodestoneRules } from '../LodestoneRules';
import { LodestoneInfos } from '../LodestoneRules';
import { LodestoneScoreHeuristic } from '../LodestoneScoreHeuristic';
import { LodestoneState } from '../LodestoneState';

class LodestoneScoreMinimax extends Minimax<LodestoneMove, LodestoneState, EmptyRulesConfig, LodestoneInfos> {
    public constructor() {
        super('Score', LodestoneRules.get(), new LodestoneScoreHeuristic(), new LodestoneMoveGenerator());
    }
}

describe('LodestoneScoreMinimax', () => {

    const rules: LodestoneRules = LodestoneRules.get();
    const minimax: LodestoneScoreMinimax = new LodestoneScoreMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = LodestoneRules.get().getDefaultRulesConfig();

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
