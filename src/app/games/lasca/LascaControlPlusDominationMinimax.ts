import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { LascaMove } from './LascaMove';
import { LascaMoveGenerator } from './LascaMoveGenerator';
import { LascaRules } from './LascaRules';
import { LascaControlPlusDominationHeuristic } from './LascaControlPlusDominationHeuristic';
import { LascaState } from './LascaState';

export class LascaControlPlusDominationMinimax extends Minimax<LascaMove, LascaState> {

    public constructor() {
        super($localize`Control and Domination`,
              LascaRules.get(),
              new LascaControlPlusDominationHeuristic(),
              new LascaMoveGenerator());
    }

}
