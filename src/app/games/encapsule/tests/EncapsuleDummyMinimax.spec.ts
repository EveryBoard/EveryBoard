/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from 'src/app/jscaip/AI/AI';
import { EncapsuleRules } from '../EncapsuleRules';
import { minimaxTest, SlowTest } from 'src/app/utils/tests/TestUtils.spec';
import { EncapsuleDummyMinimax } from '../EncapsuleDummyMinimax';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('EncapsuleDummyMinimax', () => {

    const rules: EncapsuleRules = EncapsuleRules.get();
    const minimax: EncapsuleDummyMinimax = new EncapsuleDummyMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: NoConfig = EncapsuleRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: true,
        });
    });
});
