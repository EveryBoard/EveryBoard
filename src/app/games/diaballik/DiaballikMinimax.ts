import { Minimax } from 'src/app/jscaip/Minimax';
import { DiaballikMove } from './DiaballikMove';
import { DiaballikState } from './DiaballikState';
import { DiaballikDistanceHeuristic } from './DiaballikDistanceHeuristic';
import { DiaballikRules } from './DiaballikRules';
import { DiaballikMoveGenerator } from './DiaballikMoveGenerator';

export class DiaballikMinimax extends Minimax<DiaballikMove, DiaballikState, DiaballikState> {

    public constructor() {
        super($localize`Minimax`, DiaballikRules.get(), new DiaballikDistanceHeuristic(), new DiaballikMoveGenerator());
    }
}
