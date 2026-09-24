/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../../jscaip/AI/AI';
import { minimaxTest, SlowTest } from '../../../../utils/tests/TestUtils.spec';
import { AbstractGoMinimax } from '../../AbstractGoMinimax';
import { HexagonalGoHeuristic } from '../HexagonalGoHeuristic';
import { HexagonalGoMoveGenerator } from '../HexagonalGoMoveGenerator';
import { HexagonalGoConfig, HexagonalGoRules } from '../HexagonalGoRules';

class HexagonalGoMinimax extends AbstractGoMinimax<HexagonalGoConfig> {
    public constructor() {
        super(HexagonalGoRules.get(), new HexagonalGoMoveGenerator(), new HexagonalGoHeuristic());
    }
}

describe('HexagonalGoMinimax', () => {

    const rules: HexagonalGoRules = HexagonalGoRules.get();
    const minimax: HexagonalGoMinimax = new HexagonalGoMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: HexagonalGoConfig = HexagonalGoRules.get().getDefaultRulesConfig();

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
