import { CoerceoMove } from './CoerceoMove';
import { CoerceoConfig, CoerceoRules } from './CoerceoRules';
import { CoerceoPiecesTilesFreedomHeuristic } from './CoerceoPiecesTilesFreedomHeuristic';
import { CoerceoState } from './CoerceoState';
import { CoerceoOrderedMoveGenerator } from './CoerceoOrderedMoveGenerator';
import { Minimax } from 'src/app/jscaip/AI/Minimax';

export class CoerceoPiecesTilesFreedomMinimax extends Minimax<CoerceoMove, CoerceoState, CoerceoConfig> {

    public constructor() {
        super($localize`Pieces > Tiles > Freedom`,
              CoerceoRules.get(),
              new CoerceoPiecesTilesFreedomHeuristic(),
              new CoerceoOrderedMoveGenerator());
    }

}
