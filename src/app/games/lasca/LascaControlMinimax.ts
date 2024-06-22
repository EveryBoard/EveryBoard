import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { LascaMove } from './LascaMove';
import { LascaMoveGenerator } from './LascaMoveGenerator';
import { LascaRules } from './LascaRules';
import { LascaControlHeuristic } from './LascaControlHeuristic';
import { LascaState } from './LascaState';

export class LascaControlMinimax extends Minimax<LascaMove, LascaState> {

    public constructor() {
        super($localize`Control`,
              LascaRules.get(),
              new LascaControlHeuristic(),
              new LascaMoveGenerator());
    }

}
