/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '@everyboard/games';
import { Minimax } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';

import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { TrexoAlignmentHeuristic } from '../TrexoAlignmentHeuristic';
import { TrexoMove } from '../TrexoMove';
import { TrexoMoveGenerator } from '../TrexoMoveGenerator';
import { TrexoRules } from '../TrexoRules';
import { TrexoState } from '../TrexoState';

class TrexoAlignmentMinimax extends Minimax<TrexoMove, TrexoState> {
    public constructor() {
        super('Alignment',
              TrexoRules.get(),
              new TrexoAlignmentHeuristic(),
              new TrexoMoveGenerator());
    }
}

describe('TrexoAlignmentMinimax', () => {

    const rules: TrexoRules = TrexoRules.get();
    const minimax: TrexoAlignmentMinimax = new TrexoAlignmentMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = TrexoRules.get().getDefaultRulesConfig();

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
