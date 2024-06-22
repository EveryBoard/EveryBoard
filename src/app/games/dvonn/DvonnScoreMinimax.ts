import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { DvonnMove } from './DvonnMove';
import { DvonnMoveGenerator } from './DvonnMoveGenerator';
import { DvonnRules } from './DvonnRules';
import { DvonnScoreHeuristic } from './DvonnScoreHeuristic';
import { DvonnState } from './DvonnState';

export class DvonnScoreMinimax extends Minimax<DvonnMove, DvonnState> {

    public constructor() {
        super($localize`Score`,
              DvonnRules.get(),
              new DvonnScoreHeuristic(),
              new DvonnMoveGenerator());
    }

}
