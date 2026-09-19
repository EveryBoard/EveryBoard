/* eslint-disable max-lines-per-function */
import { EmptyRulesConfig } from '../../../config/RulesConfig';
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { KamisadoHeuristic } from '../KamisadoHeuristic';
import { KamisadoMove } from '../KamisadoMove';
import { KamisadoMoveGenerator } from '../KamisadoMoveGenerator';
import { KamisadoRules } from '../KamisadoRules';
import { KamisadoState } from '../KamisadoState';
import { minimaxTest, SlowTest } from '../utils/tests/TestUtils.spec';

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
