import { MGPOptional } from '@everyboard/lib';

import { PlayerMetricHeuristic } from '../../../jscaip/AI/Minimax';
import { CheckersMove } from './CheckersMove';
import { CheckersState } from './CheckersState';
import { CheckersConfig, CheckersNode } from './AbstractCheckersRules';
import { PlayerNumberTable } from '../../../jscaip/PlayerNumberTable';

export class CheckersScoreHeuristic extends PlayerMetricHeuristic<CheckersMove, CheckersState, CheckersConfig> {

    public override getMetrics(node: CheckersNode, _config: MGPOptional<CheckersConfig>): PlayerNumberTable {
        return node.gameState.getScores().get().toTable();
    }

}
