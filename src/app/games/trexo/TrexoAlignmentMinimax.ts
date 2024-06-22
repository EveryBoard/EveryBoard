import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { TrexoMove } from './TrexoMove';
import { TrexoMoveGenerator } from './TrexoMoveGenerator';
import { TrexoRules } from './TrexoRules';
import { TrexoAlignmentHeuristic } from './TrexoAlignmentHeuristic';
import { TrexoState } from './TrexoState';

export class TrexoAlignmentMinimax extends Minimax<TrexoMove, TrexoState> {

    public constructor() {
        super($localize`Alignment`,
              TrexoRules.get(),
              new TrexoAlignmentHeuristic(),
              new TrexoMoveGenerator());
    }

}
