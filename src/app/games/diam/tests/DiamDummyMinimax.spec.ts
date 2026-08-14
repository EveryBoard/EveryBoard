import { AIDepthLimitOptions } from '@everyboard/games';
import { DummyHeuristic, Minimax } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';

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
