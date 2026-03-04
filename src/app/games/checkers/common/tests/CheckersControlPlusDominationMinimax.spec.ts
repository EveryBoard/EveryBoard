/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { AIDepthLimitOptions } from '../../../../jscaip/AI/AI';
import { minimaxTest, SlowTest } from '../../../../utils/tests/TestUtils.spec';
import { InternationalCheckersRules } from '../../international-checkers/InternationalCheckersRules';
import { LascaRules } from '../../lasca/LascaRules';
import { AbstractCheckersRules, CheckersConfig } from '../AbstractCheckersRules';
import { CheckersControlPlusDominationMinimax } from '../CheckersControlPlusDominationMinimax';

const rules: AbstractCheckersRules[] = [
    InternationalCheckersRules.get(),
    LascaRules.get(),
];

for (const rule of rules) {

    describe('CheckersControlPlusDominationMinimax for ' + rule.constructor.name, () => {
        const minimax: CheckersControlPlusDominationMinimax = new CheckersControlPlusDominationMinimax(rule);
        const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
        const defaultConfig: MGPOptional<CheckersConfig> = rule.getDefaultRulesConfig();

        SlowTest.it('should be able play against itself', () => {
            minimaxTest({
                rules: rule,
                minimax,
                options: minimaxOptions,
                config: defaultConfig,
                shouldFinish: true,
            });
        });

    });

}
