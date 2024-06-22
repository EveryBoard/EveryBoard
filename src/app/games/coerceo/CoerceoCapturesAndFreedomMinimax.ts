import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { CoerceoMove } from './CoerceoMove';
import { CoerceoConfig, CoerceoRules } from './CoerceoRules';
import { CoerceoCapturesAndFreedomHeuristic } from './CoerceoCapturesAndFreedomHeuristic';
import { CoerceoState } from './CoerceoState';
import { CoerceoOrderedMoveGenerator } from './CoerceoOrderedMoveGenerator';

export class CoerceoCapturesAndFreedomMinimax extends Minimax<CoerceoMove, CoerceoState, CoerceoConfig> {

    public constructor() {
        super($localize`Captures > Freedom`,
              CoerceoRules.get(),
              new CoerceoCapturesAndFreedomHeuristic(),
              new CoerceoOrderedMoveGenerator());
    }

}
