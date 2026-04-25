import { Minimax } from '../../jscaip/AI/Minimax';

import { LinesOfActionHeuristic } from './LinesOfActionHeuristic';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionMoveGenerator } from './LinesOfActionMoveGenerator';
import { LinesOfActionRules } from './LinesOfActionRules';
import { LinesOfActionState } from './LinesOfActionState';

export class LinesOfActionMinimax extends Minimax<LinesOfActionMove, LinesOfActionState> {

    public constructor() {
        super($localize`Minimax`,
              LinesOfActionRules.get(),
              new LinesOfActionHeuristic(),
              new LinesOfActionMoveGenerator());
    }

}
