import { EmptyRulesConfig } from '../../config/RulesConfig';
import { PlayerMetricHeuristic } from '../../jscaip/AI/PlayerMetricHeuristic';
import { Player } from '../../jscaip/Player';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';

import { KamisadoMove } from './KamisadoMove';
import { KamisadoNode, KamisadoRules } from './KamisadoRules';
import { KamisadoState } from './KamisadoState';

export class KamisadoHeuristic extends PlayerMetricHeuristic<KamisadoMove, KamisadoState> {

    public override getMetrics(node: KamisadoNode, _config: EmptyRulesConfig): PlayerNumberTable {
        const state: KamisadoState = node.gameState;
        // Metric is how far a player's piece is from the end line
        const furthest: PlayerNumberMap = KamisadoRules.getFurthestPiecePositions(state);
        return PlayerNumberTable.ofSingle(
            7 - furthest.get(Player.ZERO),
            furthest.get(Player.ONE),
        );
    }

}
