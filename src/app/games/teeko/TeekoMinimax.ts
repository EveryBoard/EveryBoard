import { Minimax } from '../../jscaip/AI/Minimax';

import { TeekoHeuristic } from './TeekoHeuristic';
import { TeekoMove } from './TeekoMove';
import { TeekoMoveGenerator } from './TeekoMoveGenerator';
import { TeekoConfig, TeekoRules } from './TeekoRules';
import { TeekoState } from './TeekoState';

export class TeekoMinimax
    extends Minimax<TeekoMove, TeekoState, TeekoConfig> {

    public constructor() {
        super($localize`Minimax`,
              TeekoRules.get(),
              new TeekoHeuristic(),
              new TeekoMoveGenerator());
    }

}
