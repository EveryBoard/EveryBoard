import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { KamisadoMove } from './KamisadoMove';
import { KamisadoNode, KamisadoRules } from './KamisadoRules';
import { KamisadoState } from './KamisadoState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class KamisadoHeuristic extends PlayerMetricHeuristic<KamisadoMove, KamisadoState> {

    public override getMetrics(node: KamisadoNode, _config: NoConfig): PlayerNumberTable {
        const state: KamisadoState = node.gameState;
        // Metric is how far a player's piece is from the end line
        const [furthest0, furthest1]: [number, number] = KamisadoRules.getFurthestPiecePositions(state);
        return PlayerNumberTable.of(
            [7 - furthest0],
            [furthest1],
        );
    }

}
