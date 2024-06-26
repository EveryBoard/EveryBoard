import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { ApagosMove } from './ApagosMove';
import { ApagosMoveGenerator } from './ApagosMoveGenerator';
import { ApagosConfig, ApagosRules } from './ApagosRules';
import { ApagosFullBoardHeuristic } from './ApagosFullBoardHeuristic';
import { ApagosState } from './ApagosState';

export class ApagosFullBoardMinimax extends Minimax<ApagosMove, ApagosState, ApagosConfig> {

    public constructor() {
        super($localize`Full Board`,
              ApagosRules.get(),
              new ApagosFullBoardHeuristic(),
              new ApagosMoveGenerator());
    }

}
