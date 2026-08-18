/* eslint-disable max-lines-per-function */
import { EmptyRulesConfig } from '../../../config/RulesConfigUtil';
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { PylosHeuristic } from '../PylosHeuristic';
import { PylosMove } from '../PylosMove';
import { PylosOrderedMoveGenerator } from '../PylosOrderedMoveGenerator';
import { PylosRules } from '../PylosRules';
import { PylosState } from '../PylosState';
import { minimaxTest, SlowTest } from '../utils/tests/TestUtils.spec';

class PylosMinimax extends Minimax<PylosMove, PylosState> {
    public constructor() {
        super('Minimax', PylosRules.get(), new PylosHeuristic(), new PylosOrderedMoveGenerator());
    }
}

describe('PylosMinimax', () => {

    const rules: PylosRules = PylosRules.get();
    const minimax: PylosMinimax = new PylosMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: EmptyRulesConfig = PylosRules.get().getDefaultRulesConfig();

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
