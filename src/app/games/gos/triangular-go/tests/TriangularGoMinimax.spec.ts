/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { AIDepthLimitOptions } from '../../../../jscaip/AI/AI';
import { minimaxTest, SlowTest } from '../../../../utils/tests/TestUtils.spec';
import { TriangularGoMinimax } from '../../triangular-go/TriangularGoMinimax';
import { TriangularGoConfig, TriangularGoRules } from '../../triangular-go/TriangularGoRules';

describe('TriangularGoMinimax', () => {

    const rules: TriangularGoRules = TriangularGoRules.get();
    const minimax: TriangularGoMinimax = new TriangularGoMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: MGPOptional<TriangularGoConfig> = TriangularGoRules.get().getDefaultRulesConfig();

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
            config: MGPOptional.of({
                ...defaultConfig.get(),
                size: 3,
            }),
            shouldFinish: true,
        });
    });

});
