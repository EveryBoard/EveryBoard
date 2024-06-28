/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI/AI';
import { TriGoConfig, TriGoRules } from '../TriGoRules';
import { minimaxTest, SlowTest } from 'src/app/utils/tests/TestUtils.spec';
import { TriGoMinimax } from '../TriGoMinimax';

describe('TriGoMinimax', () => {

    const rules: TriGoRules = TriGoRules.get();
    const minimax: TriGoMinimax = new TriGoMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: MGPOptional<TriGoConfig> = TriGoRules.get().getDefaultRulesConfig();

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
