import { EmptyRulesConfig } from '../../../config/RulesConfigUtil';
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { ConspirateursHeuristic } from '../ConspirateursHeuristic';
import { ConspirateursMove } from '../ConspirateursMove';
import { ConspirateursOrderedMoveGenerator } from '../ConspirateursOrderedMoveGenerator';
import { ConspirateursRules } from '../ConspirateursRules';
import { ConspirateursState } from '../ConspirateursState';
import { minimaxTest, SlowTest } from '../utils/tests/TestUtils.spec';

class ConspirateursJumpMinimax extends Minimax<ConspirateursMove, ConspirateursState> {
    public constructor() {
        super('Jump', ConspirateursRules.get(), new ConspirateursHeuristic(), new ConspirateursOrderedMoveGenerator());
    }
}

describe('ConspirateursJumpMinimax', () => {

    const rules: ConspirateursRules = ConspirateursRules.get();
    const minimax: Minimax<ConspirateursMove, ConspirateursState> = new ConspirateursJumpMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = ConspirateursRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able to play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not a finisher
        });
    });

});
