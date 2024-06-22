import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { CoerceoMove } from './CoerceoMove';
import { CoerceoConfig, CoerceoRules } from './CoerceoRules';
import { CoerceoPiecesThreatsTilesHeuristic } from './CoerceoPiecesThreatsTilesHeuristic';
import { CoerceoState } from './CoerceoState';
import { CoerceoOrderedMoveGenerator } from './CoerceoOrderedMoveGenerator';

export class CoerceoPiecesThreatsTilesMinimax extends Minimax<CoerceoMove, CoerceoState, CoerceoConfig> {

    public constructor() {
        super($localize`Pieces > Threats > Tiles`,
              CoerceoRules.get(),
              new CoerceoPiecesThreatsTilesHeuristic(),
              new CoerceoOrderedMoveGenerator());
    }

}
