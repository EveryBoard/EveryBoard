import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { TeekoMove } from './TeekoMove';
import { TeekoMoveGenerator } from './TeekoMoveGenerator';
import { TeekoConfig, TeekoRules } from './TeekoRules';
import { TeekoHeuristic } from './TeekoHeuristic';
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
