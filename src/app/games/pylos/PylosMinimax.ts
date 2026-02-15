import { Minimax } from '../../jscaip/AI/Minimax';
import { PylosHeuristic } from './PylosHeuristic';
import { PylosMove } from './PylosMove';
import { PylosOrderedMoveGenerator } from './PylosOrderedMoveGenerator';
import { PylosRules } from './PylosRules';
import { PylosState } from './PylosState';

export class PylosMinimax extends Minimax<PylosMove, PylosState> {

    public constructor() {
        super($localize`Minimax`,
              PylosRules.get(),
              new PylosHeuristic(),
              new PylosOrderedMoveGenerator());
    }

}
