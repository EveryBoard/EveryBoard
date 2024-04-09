import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { SquarzMove } from './SquarzMove';
import { SquarzConfig, SquarzNode } from './SquarzRules';
import { SquarzState } from './SquarzState';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';

export class SquarzHeuristic extends PlayerMetricHeuristic<SquarzMove, SquarzState, SquarzConfig> {

    public override getMetrics(node: SquarzNode): PlayerNumberTable {
        return node.gameState.getScores().toTable();
    }

}
