import { PlayerMetricHeuristic } from '@everyboard/games';
import { PlayerNumberTable } from '@everyboard/games';

import { CheckersConfig, CheckersNode } from './AbstractCheckersRules';
import { CheckersMove } from './CheckersMove';
import { CheckersState } from './CheckersState';

export class CheckersScoreHeuristic extends PlayerMetricHeuristic<CheckersMove, CheckersState, CheckersConfig> {

    public override getMetrics(node: CheckersNode, _config: CheckersConfig): PlayerNumberTable {
        return node.gameState.getScores().get().toTable();
    }

}
