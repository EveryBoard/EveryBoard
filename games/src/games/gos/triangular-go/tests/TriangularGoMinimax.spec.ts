/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../../jscaip/AI/AI';
import { minimaxTest, SlowTest } from '../../../../utils/tests/TestUtils.spec';
import { AbstractGoMinimax } from '../../AbstractGoMinimax';
import { TriangularGoConfig, TriangularGoRules } from '../../triangular-go/TriangularGoRules';
import { TriangularGoHeuristic } from '../TriangularGoHeuristic';
import { TriangularGoMoveGenerator } from '../TriangularGoMoveGenerator';

class TriangularGoMinimax extends AbstractGoMinimax<TriangularGoConfig> {
    public constructor() {
        super( TriangularGoRules.get(), new TriangularGoMoveGenerator(), new TriangularGoHeuristic());
    }
}

describe('TriangularGoMinimax', () => {

    const rules: TriangularGoRules = TriangularGoRules.get();
    const minimax: TriangularGoMinimax = new TriangularGoMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: TriangularGoConfig = TriangularGoRules.get().getDefaultRulesConfig();

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
                size: 3,
            },
            shouldFinish: true,
        });
    });

});
