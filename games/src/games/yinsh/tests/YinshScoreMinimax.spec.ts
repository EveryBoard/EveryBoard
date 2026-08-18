/* eslint-disable max-lines-per-function */
import { EmptyRulesConfig } from '../../../config/RulesConfigUtil';
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { YinshMove } from '../YinshMove';
import { YinshMoveGenerator } from '../YinshMoveGenerator';
import { YinshRules } from '../YinshRules';
import { YinshLegalityInformation } from '../YinshRules';
import { YinshScoreHeuristic } from '../YinshScoreHeuristic';
import { YinshState } from '../YinshState';
import { minimaxTest, SlowTest } from '../utils/tests/TestUtils.spec';

class YinshScoreMinimax extends Minimax<YinshMove, YinshState, EmptyRulesConfig, YinshLegalityInformation> {
    public constructor() {
        super('Score', YinshRules.get(), new YinshScoreHeuristic(), new YinshMoveGenerator());
    }
}

describe('YinshScoreMinimax', () => {

    const rules: YinshRules = YinshRules.get();
    const minimax: YinshScoreMinimax = new YinshScoreMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = YinshRules.get().getDefaultRulesConfig();

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
