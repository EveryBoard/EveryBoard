import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { DiaballikMove } from './DiaballikMove';
import { DiaballikState } from './DiaballikState';
import { DiaballikDistanceHeuristic } from './DiaballikDistanceHeuristic';
import { DiaballikRules } from './DiaballikRules';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';

export class DiaballikMinimax extends Minimax<DiaballikMove, DiaballikState, DiaballikState> {

    public constructor(name: string, moveGenerator: MoveGenerator<DiaballikMove, DiaballikState>) {
        super(name, DiaballikRules.get(), new DiaballikDistanceHeuristic(), moveGenerator);
    }
}
