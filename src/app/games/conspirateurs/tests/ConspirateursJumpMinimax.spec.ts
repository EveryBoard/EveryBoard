import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { NoConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { ConspirateursJumpMinimax } from '../ConspirateursJumpMinimax';
import { ConspirateursMove } from '../ConspirateursMove';
import { ConspirateursRules } from '../ConspirateursRules';
import { ConspirateursState } from '../ConspirateursState';

describe('ConspirateursJumpMinimax', () => {

    const rules: ConspirateursRules = ConspirateursRules.get();
    const minimax: Minimax<ConspirateursMove, ConspirateursState> = new ConspirateursJumpMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: NoConfig = ConspirateursRules.get().getDefaultRulesConfig();

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
