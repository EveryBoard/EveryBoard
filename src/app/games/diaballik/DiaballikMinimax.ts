import { Minimax } from 'src/app/jscaip/Minimax';
import { DiaballikMove } from './DiaballikMove';
import { DiaballikState } from './DiaballikState';
import { DiaballikDistanceHeuristic } from './DiaballikDistanceHeuristic';
import { DiaballikRules } from './DiaballikRules';
import { MoveGenerator } from 'src/app/jscaip/AI';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

export class DiaballikMinimax extends Minimax<DiaballikMove, DiaballikState, EmptyRulesConfig, DiaballikState> {

    public constructor(name: string, moveGenerator: MoveGenerator<DiaballikMove, DiaballikState>) {
        super(name, DiaballikRules.get(), new DiaballikDistanceHeuristic(), moveGenerator);
    }
}
