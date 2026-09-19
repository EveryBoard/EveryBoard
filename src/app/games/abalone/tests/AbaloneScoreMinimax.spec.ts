/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { AbaloneMove } from '../AbaloneMove';
import { AbaloneMoveGenerator } from '../AbaloneMoveGenerator';
import { AbaloneConfig, AbaloneRules } from '../AbaloneRules';
import { AbaloneLegalityInformation } from '../AbaloneRules';
import { AbaloneScoreHeuristic } from '../AbaloneScoreHeuristic';
import { AbaloneState } from '../AbaloneState';

class AbaloneScoreMinimax extends Minimax<AbaloneMove, AbaloneState, AbaloneConfig, AbaloneLegalityInformation> {
    public constructor() {
        super('Score', AbaloneRules.get(), new AbaloneScoreHeuristic(), new AbaloneMoveGenerator());
    }
}

describe('AbaloneScoreMinimax', () => {

    const rules: AbaloneRules = AbaloneRules.get();
    const minimax: AbaloneScoreMinimax = new AbaloneScoreMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: AbaloneConfig = AbaloneRules.get().getDefaultRulesConfig();

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
