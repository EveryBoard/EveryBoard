import { Minimax } from '../../jscaip/AI/Minimax';
import { CoerceoMove } from './CoerceoMove';
import { CoerceoOrderedMoveGenerator } from './CoerceoOrderedMoveGenerator';
import { CoerceoPiecesThreatsTilesHeuristic } from './CoerceoPiecesThreatsTilesHeuristic';
import { CoerceoConfig, CoerceoRules } from './CoerceoRules';
import { CoerceoState } from './CoerceoState';

export class CoerceoPiecesThreatsTilesMinimax extends Minimax<CoerceoMove, CoerceoState, CoerceoConfig> {

    public constructor() {
        super($localize`Pieces > Threats > Tiles`,
              CoerceoRules.get(),
              new CoerceoPiecesThreatsTilesHeuristic(),
              new CoerceoOrderedMoveGenerator());
    }

}
