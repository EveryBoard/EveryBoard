/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { minimaxTest, SlowTest } from '../../../utils/tests/TestUtils.spec';
import { TaflConfig } from '../TaflConfig';
import { TaflEscapeThenPieceThenControlMinimax } from '../TaflEscapeThenPieceThenControlMinimax';
import { TablutMove } from '../tablut/TablutMove';
import { TablutRules } from '../tablut/TablutRules';

describe('TaflEscapeThenPieceThenControlMinimax', () => {

    const minimax: TaflEscapeThenPieceThenControlMinimax<TablutMove> =
        new TaflEscapeThenPieceThenControlMinimax(TablutRules.get());
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: MGPOptional<TaflConfig> = TablutRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules: TablutRules.get(),
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not always a finisher
        });
    });

});
