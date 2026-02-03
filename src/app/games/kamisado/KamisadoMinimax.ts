import { Minimax } from '../../jscaip/AI/Minimax';
import { KamisadoHeuristic } from './KamisadoHeuristic';
import { KamisadoMove } from './KamisadoMove';
import { KamisadoMoveGenerator } from './KamisadoMoveGenerator';
import { KamisadoRules } from './KamisadoRules';
import { KamisadoState } from './KamisadoState';

export class KamisadoMinimax extends Minimax<KamisadoMove, KamisadoState> {

    public constructor() {
        super($localize`Minimax`,
              KamisadoRules.get(),
              new KamisadoHeuristic(),
              new KamisadoMoveGenerator());
    }

}
