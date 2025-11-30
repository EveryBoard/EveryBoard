import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { SquarzMove } from './SquarzMove';
import { SquarzConfig, SquarzNode } from './SquarzRules';
import { SquarzState } from './SquarzState';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';

export class SquarzHeuristic extends PlayerMetricHeuristic<SquarzMove, SquarzState, SquarzConfig> {

    public override getMetrics(node: SquarzNode): PlayerNumberTable {
        return node.gameState.getScores().toTable();
    }

}
