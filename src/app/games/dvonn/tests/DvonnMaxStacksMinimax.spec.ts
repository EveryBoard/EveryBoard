/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '@everyboard/games';
import { Minimax } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';

import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { DvonnMaxStacksHeuristic } from '../DvonnMaxStacksHeuristic';
import { DvonnMove } from '../DvonnMove';
import { DvonnMoveGenerator } from '../DvonnMoveGenerator';
import { DvonnRules } from '../DvonnRules';
import { DvonnState } from '../DvonnState';

class DvonnMaxStacksMinimax extends Minimax<DvonnMove, DvonnState> {
    public constructor() {
        super('Stacks', DvonnRules.get(), new DvonnMaxStacksHeuristic(), new DvonnMoveGenerator());
    }
}

describe('DvonnMaxStacksMinimax', () => {

    const rules: DvonnRules = DvonnRules.get();
    const minimax: DvonnMaxStacksMinimax = new DvonnMaxStacksMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = DvonnRules.get().getDefaultRulesConfig();

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
