import { PlayerMetricHeuristic } from '../../../jscaip/AI/PlayerMetricHeuristic';
import { PlayerNumberTable } from '../../../jscaip/PlayerNumberTable';

import { MancalaConfig } from './MancalaConfig';
import { MancalaMove } from './MancalaMove';
import { MancalaNode } from './MancalaRules';
import { MancalaState } from './MancalaState';

export class MancalaScoreHeuristic extends PlayerMetricHeuristic<MancalaMove, MancalaState, MancalaConfig>
{

    public override getMetrics(node: MancalaNode, _config: MancalaConfig): PlayerNumberTable {
        return node.gameState.getScoresCopy().toTable();
    }

}
