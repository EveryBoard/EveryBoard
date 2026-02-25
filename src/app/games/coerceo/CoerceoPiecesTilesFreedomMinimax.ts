import { Minimax } from '../../jscaip/AI/Minimax';

import { CoerceoMove } from './CoerceoMove';
import { CoerceoOrderedMoveGenerator } from './CoerceoOrderedMoveGenerator';
import { CoerceoPiecesTilesFreedomHeuristic } from './CoerceoPiecesTilesFreedomHeuristic';
import { CoerceoConfig, CoerceoRules } from './CoerceoRules';
import { CoerceoState } from './CoerceoState';

export class CoerceoPiecesTilesFreedomMinimax extends Minimax<CoerceoMove, CoerceoState, CoerceoConfig> {

    public constructor() {
        super($localize`Pieces > Tiles > Freedom`,
              CoerceoRules.get(),
              new CoerceoPiecesTilesFreedomHeuristic(),
              new CoerceoOrderedMoveGenerator());
    }

}
