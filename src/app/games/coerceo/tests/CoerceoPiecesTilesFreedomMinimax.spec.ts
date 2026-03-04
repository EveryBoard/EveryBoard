/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { CoerceoPiecesTilesFreedomMinimax } from '../CoerceoPiecesTilesFreedomMinimax';
import { CoerceoConfig, CoerceoRules } from '../CoerceoRules';

describe('CoerceoPiecesTilesFreedomMinimax', () => {

    const rules: CoerceoRules = CoerceoRules.get();
    const minimax: CoerceoPiecesTilesFreedomMinimax = new CoerceoPiecesTilesFreedomMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: MGPOptional<CoerceoConfig> = CoerceoRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not a finisher
        });
    });

});
