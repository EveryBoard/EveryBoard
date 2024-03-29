import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { RectanglzMove } from './RectanglzMove';
import { RectanglzConfig, RectanglzNode } from './RectanglzRules';
import { RectanglzState } from './RectanglzState';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';

export class RectanglzHeuristic extends PlayerMetricHeuristic<RectanglzMove, RectanglzState, RectanglzConfig> {

    public override getMetrics(node: RectanglzNode): PlayerNumberTable {
        return node.gameState.getScores().toTable();
    }

}
