import { Minimax } from '../../jscaip/AI/Minimax';
import { QuixoHeuristic } from './QuixoHeuristic';
import { QuixoMove } from './QuixoMove';
import { QuixoMoveGenerator } from './QuixoMoveGenerator';
import { QuixoRules } from './QuixoRules';
import { QuixoConfig, QuixoState } from './QuixoState';

export class QuixoMinimax extends Minimax<QuixoMove, QuixoState, QuixoConfig> {

    public constructor() {
        super($localize`Minimax`,
              QuixoRules.get(),
              new QuixoHeuristic(),
              new QuixoMoveGenerator());
    }

}
