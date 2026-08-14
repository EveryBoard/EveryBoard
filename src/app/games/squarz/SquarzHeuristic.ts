import { PlayerMetricHeuristic } from '@everyboard/games';
import { PlayerNumberTable } from '@everyboard/games';

import { SquarzMove } from './SquarzMove';
import { SquarzConfig, SquarzNode } from './SquarzRules';
import { SquarzState } from './SquarzState';

export class SquarzHeuristic extends PlayerMetricHeuristic<SquarzMove, SquarzState, SquarzConfig> {

    public override getMetrics(node: SquarzNode): PlayerNumberTable {
        return node.gameState.getScores().toTable();
    }

}
