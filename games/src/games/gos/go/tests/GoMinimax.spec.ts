/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../../jscaip/AI/AI';
import { AbstractGoMinimax } from '../../AbstractGoMinimax';
import { minimaxTest, SlowTest } from '../../utils/tests/TestUtils.spec';
import { GoHeuristic } from '../GoHeuristic';
import { GoMoveGenerator } from '../GoMoveGenerator';
import { GoConfig, GoRules } from '../GoRules';

class GoMinimax extends AbstractGoMinimax<GoConfig> {
    public constructor() {
        super(GoRules.get(), new GoMoveGenerator(), new GoHeuristic());
    }
}

describe('GoMinimax', () => {

    const rules: GoRules = GoRules.get();
    const minimax: GoMinimax = new GoMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: GoConfig = GoRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not a finisher, 3 seconds per turn
        });
    });

    SlowTest.it('should be able play against itself (smaller finishable config)', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: {
                ...defaultConfig,
                height: 3,
                width: 3,
            },
            shouldFinish: true,
        });
    });

});
