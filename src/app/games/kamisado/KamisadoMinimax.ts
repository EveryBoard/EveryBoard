import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { KamisadoMove } from './KamisadoMove';
import { KamisadoMoveGenerator } from './KamisadoMoveGenerator';
import { KamisadoRules } from './KamisadoRules';
import { KamisadoHeuristic } from './KamisadoHeuristic';
import { KamisadoState } from './KamisadoState';

export class KamisadoMinimax extends Minimax<KamisadoMove, KamisadoState> {

    public constructor() {
        super($localize`Minimax`,
              KamisadoRules.get(),
              new KamisadoHeuristic(),
              new KamisadoMoveGenerator());
    }

}
