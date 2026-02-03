import { Minimax } from '../../jscaip/AI/Minimax';
import { ApagosMove } from './ApagosMove';
import { ApagosMoveGenerator } from './ApagosMoveGenerator';
import { ApagosRightmostHeuristic } from './ApagosRightmostHeuristic';
import { ApagosConfig, ApagosRules } from './ApagosRules';
import { ApagosState } from './ApagosState';

export class ApagosRightmostMinimax extends Minimax<ApagosMove, ApagosState, ApagosConfig> {

    public constructor() {
        super($localize`Rightmost Focus`,
              ApagosRules.get(),
              new ApagosRightmostHeuristic(),
              new ApagosMoveGenerator());
    }

}
