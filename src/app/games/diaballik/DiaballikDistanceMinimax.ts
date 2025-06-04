import { Minimax } from '../../../app/jscaip/AI/Minimax';
import { DiaballikMove } from './DiaballikMove';
import { DiaballikState } from './DiaballikState';
import { DiaballikDistanceHeuristic } from './DiaballikDistanceHeuristic';
import { DiaballikRules } from './DiaballikRules';
import { MoveGenerator } from '../../../app/jscaip/AI/AI';
import { EmptyRulesConfig } from '../../../app/jscaip/RulesConfigUtil';

export class DiaballikDistanceMinimax extends Minimax<DiaballikMove, DiaballikState, EmptyRulesConfig, DiaballikState> {

    public constructor(name: string, moveGenerator: MoveGenerator<DiaballikMove, DiaballikState>) {
        super(name,
              DiaballikRules.get(),
              new DiaballikDistanceHeuristic(),
              moveGenerator,
        );
    }
}
