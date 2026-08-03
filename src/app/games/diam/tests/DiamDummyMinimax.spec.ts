import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { DummyHeuristic, Minimax } from '../../../jscaip/AI/Minimax';
import { EmptyRulesConfig } from '../../../jscaip/RulesConfigUtil';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { DiamMove } from '../DiamMove';
import { DiamMoveGenerator } from '../DiamMoveGenerator';
import { DiamRules } from '../DiamRules';
import { DiamState } from '../DiamState';

class DiamDummyMinimax extends Minimax<DiamMove, DiamState> {
    public constructor() {
        super('Dummy', DiamRules.get(), new DummyHeuristic(), new DiamMoveGenerator());
    }
}

describe('DiamDummyMinimax', () => {

    const rules: DiamRules = DiamRules.get();
    const minimax: DiamDummyMinimax = new DiamDummyMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = DiamRules.get().getDefaultRulesConfig();

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
