import { EmptyRulesConfig } from '../../config/RulesConfig';
import { BoardValue } from '../../jscaip/AI/BoardValue';
import { HeuristicBounds } from '../../jscaip/AI/Heuristic';
import { PlayerMetricHeuristicWithBounds } from '../../jscaip/AI/Minimax';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';

import { DvonnMove } from './DvonnMove';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnState } from './DvonnState';

export class DvonnScoreHeuristic extends PlayerMetricHeuristicWithBounds<DvonnMove, DvonnState> {

    public override getMetrics(node: DvonnNode, _config: EmptyRulesConfig): PlayerNumberTable {
        // The metric the total number of pieces controlled by a player
        return DvonnRules.getScores(node.gameState).toTable();
    }

    // Min/max value: all pieces are controlled by one. There are 49 pieces
    public override getBounds(_config: EmptyRulesConfig): HeuristicBounds<BoardValue> {
        const numberOfPieces: number = 49;
        return {
            player0Best: BoardValue.ofSingle(numberOfPieces, 0),
            player1Best: BoardValue.ofSingle(0, numberOfPieces),
        };
    }
}
