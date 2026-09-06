/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { CoerceoMove } from '../CoerceoMove';
import { CoerceoOrderedMoveGenerator } from '../CoerceoOrderedMoveGenerator';
import { CoerceoPiecesThreatsTilesHeuristic } from '../CoerceoPiecesThreatsTilesHeuristic';
import { CoerceoConfig, CoerceoRules } from '../CoerceoRules';
import { CoerceoState } from '../CoerceoState';
import { minimaxTest, SlowTest } from '../utils/tests/TestUtils.spec';

class CoerceoPiecesThreatsTilesMinimax extends Minimax<CoerceoMove, CoerceoState, CoerceoConfig> {
    public constructor() {
        super(`Pieces > Threats > Tiles`, CoerceoRules.get(), new CoerceoPiecesThreatsTilesHeuristic(), new CoerceoOrderedMoveGenerator());
    }
}

describe('CoerceoPiecesThreatsTilesMinimax', () => {

    const rules: CoerceoRules = CoerceoRules.get();
    const minimax: CoerceoPiecesThreatsTilesMinimax = new CoerceoPiecesThreatsTilesMinimax();
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: CoerceoConfig = CoerceoRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules,
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not a finisher
        });
    });

});
