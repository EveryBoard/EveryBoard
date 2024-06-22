import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { DvonnMove } from './DvonnMove';
import { DvonnMoveGenerator } from './DvonnMoveGenerator';
import { DvonnRules } from './DvonnRules';
import { DvonnMaxStacksHeuristic } from './DvonnMaxStacksHeuristic';
import { DvonnState } from './DvonnState';

export class DvonnMaxStacksMinimax extends Minimax<DvonnMove, DvonnState> {

    public constructor() {
        super($localize`Stacks`,
              DvonnRules.get(),
              new DvonnMaxStacksHeuristic(),
              new DvonnMoveGenerator());
    }

}
