/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '@everyboard/games';
import { DummyHeuristic, Minimax } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';

import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { PentagoMove } from '../PentagoMove';
import { PentagoMoveGenerator } from '../PentagoMoveGenerator';
import { PentagoRules } from '../PentagoRules';
import { PentagoState } from '../PentagoState';

class PentagoDummyMinimax extends Minimax<PentagoMove, PentagoState> {
    public constructor() {
        super('Dummy', PentagoRules.get(), new DummyHeuristic(), new PentagoMoveGenerator());
    }
}

describe('PentagoDummyMinimax', () => {

    const rules: PentagoRules = PentagoRules.get();
    const minimax: PentagoDummyMinimax = new PentagoDummyMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = PentagoRules.get().getDefaultRulesConfig();

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
