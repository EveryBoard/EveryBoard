import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { HiveMove } from './HiveMove';
import { HiveMoveGenerator } from './HiveMoveGenerator';
import { HiveRules } from './HiveRules';
import { HiveHeuristic } from './HiveHeuristic';
import { HiveState } from './HiveState';

export class HiveMinimax extends Minimax<HiveMove, HiveState> {

    public constructor() {
        super($localize`Minimax`,
              HiveRules.get(),
              new HiveHeuristic(),
              new HiveMoveGenerator());
    }

}
