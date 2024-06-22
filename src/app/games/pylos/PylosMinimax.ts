import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { PylosMove } from './PylosMove';
import { PylosRules } from './PylosRules';
import { PylosHeuristic } from './PylosHeuristic';
import { PylosState } from './PylosState';
import { PylosOrderedMoveGenerator } from './PylosOrderedMoveGenerator';

export class PylosMinimax extends Minimax<PylosMove, PylosState> {

    public constructor() {
        super($localize`Minimax`,
              PylosRules.get(),
              new PylosHeuristic(),
              new PylosOrderedMoveGenerator());
    }

}
