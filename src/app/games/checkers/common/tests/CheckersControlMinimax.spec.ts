/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../../jscaip/AI/AI';
import { minimaxTest, SlowTest } from '../../../../utils/tests/TestUtils.spec';
import { InternationalCheckersRules } from '../../international-checkers/InternationalCheckersRules';
import { LascaRules } from '../../lasca/LascaRules';
import { AbstractCheckersRules, CheckersConfig } from '../AbstractCheckersRules';
import { CheckersControlMinimax } from '../CheckersControlMinimax';

const rules: AbstractCheckersRules[] = [
    InternationalCheckersRules.get(),
    LascaRules.get(),
];

for (const rule of rules) {

    describe('CheckersControlMinimax for ' + rule.constructor.name, () => {

        const minimax: CheckersControlMinimax = new CheckersControlMinimax(rule);
        const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
        const defaultConfig: CheckersConfig = rule.getDefaultRulesConfig();

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
