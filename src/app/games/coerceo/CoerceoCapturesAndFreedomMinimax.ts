import { Minimax } from '../../jscaip/AI/Minimax';

import { CoerceoCapturesAndFreedomHeuristic } from './CoerceoCapturesAndFreedomHeuristic';
import { CoerceoMove } from './CoerceoMove';
import { CoerceoOrderedMoveGenerator } from './CoerceoOrderedMoveGenerator';
import { CoerceoConfig, CoerceoRules } from './CoerceoRules';
import { CoerceoState } from './CoerceoState';

export class CoerceoCapturesAndFreedomMinimax extends Minimax<CoerceoMove, CoerceoState, CoerceoConfig> {

    public constructor() {
        super($localize`Captures > Freedom`,
              CoerceoRules.get(),
              new CoerceoCapturesAndFreedomHeuristic(),
              new CoerceoOrderedMoveGenerator());
    }

}
