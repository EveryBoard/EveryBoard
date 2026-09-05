/* eslint-disable max-lines-per-function */
import { EmptyRulesConfig } from '../../../config/RulesConfig';
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { DummyHeuristic, Minimax } from '../../../jscaip/AI/Minimax';
import { PentagoMove } from '../PentagoMove';
import { PentagoMoveGenerator } from '../PentagoMoveGenerator';
import { PentagoRules } from '../PentagoRules';
import { PentagoState } from '../PentagoState';
import { minimaxTest, SlowTest } from '../utils/tests/TestUtils.spec';

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
