import { Minimax } from '../../jscaip/AI/Minimax';
import { HiveHeuristic } from './HiveHeuristic';
import { HiveMove } from './HiveMove';
import { HiveMoveGenerator } from './HiveMoveGenerator';
import { HiveRules } from './HiveRules';
import { HiveState } from './HiveState';

export class HiveMinimax extends Minimax<HiveMove, HiveState> {

    public constructor() {
        super($localize`Minimax`,
              HiveRules.get(),
              new HiveHeuristic(),
              new HiveMoveGenerator());
    }

}
