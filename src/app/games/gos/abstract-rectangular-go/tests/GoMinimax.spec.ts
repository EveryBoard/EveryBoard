/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../../jscaip/AI/AI';
import { minimaxTest, SlowTest } from '../../../../utils/tests/TestUtils.spec';
import { AbstractGoMinimax } from '../../AbstractGoMinimax';
import { GoHeuristic } from '../../go/GoHeuristic';
import { GoMoveGenerator } from '../../go/GoMoveGenerator';
import { GoRules } from '../../go/GoRules';
import { RectangularGoConfig } from '../AbstractRectangularGoRules';

class GoMinimax extends AbstractGoMinimax<RectangularGoConfig> {
    public constructor() {
        super(GoRules.get(), new GoMoveGenerator(), new GoHeuristic());
    }
}

describe('GoMinimax', () => {

    const rules: GoRules = GoRules.get();
    const minimax: GoMinimax = new GoMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: RectangularGoConfig = GoRules.get().getDefaultRulesConfig();

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
