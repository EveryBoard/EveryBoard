import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { ApagosMove } from './ApagosMove';
import { ApagosMoveGenerator } from './ApagosMoveGenerator';
import { ApagosRules } from './ApagosRules';
import { ApagosRightmostHeuristic } from './ApagosRightmostHeuristic';
import { ApagosState } from './ApagosState';

export class ApagosRightmostMinimax extends Minimax<ApagosMove, ApagosState> {

    public constructor() {
        super($localize`Rightmost Focus`,
              ApagosRules.get(),
              new ApagosRightmostHeuristic(),
              new ApagosMoveGenerator());
    }

}
