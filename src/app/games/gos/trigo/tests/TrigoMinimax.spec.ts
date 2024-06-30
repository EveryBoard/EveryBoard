/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI/AI';
import { TrigoConfig, TrigoRules } from '../TrigoRules';
import { minimaxTest, SlowTest } from 'src/app/utils/tests/TestUtils.spec';
import { TrigoMinimax } from '../TrigoMinimax';

describe('TrigoMinimax', () => {

    const rules: TrigoRules = TrigoRules.get();
    const minimax: TrigoMinimax = new TrigoMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: MGPOptional<TrigoConfig> = TrigoRules.get().getDefaultRulesConfig();

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
