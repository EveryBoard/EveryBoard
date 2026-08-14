/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '@everyboard/games';
import { Minimax } from '@everyboard/games';

import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { QuixoHeuristic } from '../QuixoHeuristic';
import { QuixoMove } from '../QuixoMove';
import { QuixoMoveGenerator } from '../QuixoMoveGenerator';
import { QuixoRules } from '../QuixoRules';
import { QuixoConfig } from '../QuixoState';
import { QuixoState } from '../QuixoState';

class QuixoMinimax extends Minimax<QuixoMove, QuixoState, QuixoConfig> {
    public constructor() {
        super('Minimax', QuixoRules.get(), new QuixoHeuristic(), new QuixoMoveGenerator());
    }
}

describe('QuixoMinimax', () => {

    const rules: QuixoRules = QuixoRules.get();
    const minimax: QuixoMinimax = new QuixoMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: QuixoConfig = QuixoRules.get().getDefaultRulesConfig();

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
