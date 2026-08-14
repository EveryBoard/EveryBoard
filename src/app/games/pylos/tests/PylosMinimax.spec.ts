/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '@everyboard/games';
import { Minimax } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';

import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { PylosHeuristic } from '../PylosHeuristic';
import { PylosMove } from '../PylosMove';
import { PylosOrderedMoveGenerator } from '../PylosOrderedMoveGenerator';
import { PylosRules } from '../PylosRules';
import { PylosState } from '../PylosState';

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
