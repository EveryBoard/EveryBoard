/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '@everyboard/games';
import { Minimax } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';

import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { KamisadoHeuristic } from '../KamisadoHeuristic';
import { KamisadoMove } from '../KamisadoMove';
import { KamisadoMoveGenerator } from '../KamisadoMoveGenerator';
import { KamisadoRules } from '../KamisadoRules';
import { KamisadoState } from '../KamisadoState';

class KamisadoMinimax extends Minimax<KamisadoMove, KamisadoState> {
    public constructor() {
        super('Minimax', KamisadoRules.get(), new KamisadoHeuristic(), new KamisadoMoveGenerator());
    }
}

describe('KamisadoMinimax', () => {

    const rules: KamisadoRules = KamisadoRules.get();
    const minimax: KamisadoMinimax = new KamisadoMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = KamisadoRules.get().getDefaultRulesConfig();

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
