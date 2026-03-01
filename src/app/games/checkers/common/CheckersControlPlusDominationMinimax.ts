import { Minimax } from '../../../jscaip/AI/Minimax';

import { AbstractCheckersRules, CheckersConfig } from './AbstractCheckersRules';
import { CheckersControlPlusDominationHeuristic } from './CheckersControlPlusDominationHeuristic';
import { CheckersMove } from './CheckersMove';
import { CheckersMoveGenerator } from './CheckersMoveGenerator';
import { CheckersState } from './CheckersState';

export class CheckersControlPlusDominationMinimax extends Minimax<CheckersMove, CheckersState, CheckersConfig> {

    public constructor(rules: AbstractCheckersRules) {
        super($localize`Control and Domination`,
              rules,
              new CheckersControlPlusDominationHeuristic(rules),
              new CheckersMoveGenerator(rules),
        );
    }

}
