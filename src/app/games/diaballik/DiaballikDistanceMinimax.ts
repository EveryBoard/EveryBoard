import { MoveGenerator } from '../../jscaip/AI/AI';
import { Minimax } from '../../jscaip/AI/Minimax';
import { EmptyRulesConfig } from '../../jscaip/RulesConfigUtil';
import { DiaballikDistanceHeuristic } from './DiaballikDistanceHeuristic';
import { DiaballikMove } from './DiaballikMove';
import { DiaballikRules } from './DiaballikRules';
import { DiaballikState } from './DiaballikState';

export class DiaballikDistanceMinimax extends Minimax<DiaballikMove, DiaballikState, EmptyRulesConfig, DiaballikState> {

    public constructor(name: string, moveGenerator: MoveGenerator<DiaballikMove, DiaballikState>) {
        super(name,
              DiaballikRules.get(),
              new DiaballikDistanceHeuristic(),
              moveGenerator,
        );
    }
}
