/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { AIDepthLimitOptions } from '../../../../jscaip/AI/AI';
import { HexagonalGoConfig, HexagonalGoRules } from '../HexagonalGoRules';
import { minimaxTest, SlowTest } from '../../../../utils/tests/TestUtils.spec';
import { HexagonalGoMinimax } from '../HexagonalGoMinimax';

describe('HexagonalGoMinimax', () => {

    const rules: HexagonalGoRules = HexagonalGoRules.get();
    const minimax: HexagonalGoMinimax = new HexagonalGoMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: MGPOptional<HexagonalGoConfig> = HexagonalGoRules.get().getDefaultRulesConfig();

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
