import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { KamisadoMove } from './KamisadoMove';
import { KamisadoNode, KamisadoRules } from './KamisadoRules';
import { KamisadoState } from './KamisadoState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { Player } from 'src/app/jscaip/Player';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

export class KamisadoHeuristic extends PlayerMetricHeuristic<KamisadoMove, KamisadoState> {

    public override getMetrics(node: KamisadoNode, _config: NoConfig): PlayerNumberTable {
        const state: KamisadoState = node.gameState;
        // Metric is how far a player's piece is from the end line
        const furthest: PlayerNumberMap = KamisadoRules.getFurthestPiecePositions(state);
        return PlayerNumberTable.ofSingle(
            7 - furthest.get(Player.ZERO),
            furthest.get(Player.ONE),
        );
    }

}
