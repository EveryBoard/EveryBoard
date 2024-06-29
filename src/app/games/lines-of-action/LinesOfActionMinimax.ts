import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionMoveGenerator } from './LinesOfActionMoveGenerator';
import { LinesOfActionRules } from './LinesOfActionRules';
import { LinesOfActionHeuristic } from './LinesOfActionHeuristic';
import { LinesOfActionState } from './LinesOfActionState';

export class LinesOfActionMinimax extends Minimax<LinesOfActionMove, LinesOfActionState> {

    public constructor() {
        super($localize`Minimax`,
              LinesOfActionRules.get(),
              new LinesOfActionHeuristic(),
              new LinesOfActionMoveGenerator());
    }

}
