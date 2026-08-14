/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '@everyboard/games';
import { Minimax } from '@everyboard/games';

import { minimaxTest, SlowTest } from '../../../../utils/tests/TestUtils.spec';
import { InternationalCheckersRules } from '../../international-checkers/InternationalCheckersRules';
import { LascaRules } from '../../lasca/LascaRules';
import { AbstractCheckersRules, CheckersConfig } from '../AbstractCheckersRules';
import { CheckersControlPlusDominationHeuristic } from '../CheckersControlPlusDominationHeuristic';
import { CheckersMove } from '../CheckersMove';
import { CheckersMoveGenerator } from '../CheckersMoveGenerator';
import { CheckersState } from '../CheckersState';

class CheckersControlPlusDominationMinimax extends Minimax<CheckersMove, CheckersState, CheckersConfig> {
    public constructor(rules: AbstractCheckersRules) {
        super('Control and Domination',
              rules,
              new CheckersControlPlusDominationHeuristic(rules),
              new CheckersMoveGenerator(rules),
        );
    }
}

const rules: AbstractCheckersRules[] = [
    InternationalCheckersRules.get(),
    LascaRules.get(),
];

for (const rule of rules) {

    describe('CheckersControlPlusDominationMinimax for ' + rule.constructor.name, () => {
        const minimax: CheckersControlPlusDominationMinimax = new CheckersControlPlusDominationMinimax(rule);
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
