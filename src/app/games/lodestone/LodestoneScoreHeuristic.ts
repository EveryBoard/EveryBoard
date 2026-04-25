import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { NoConfig } from '../../jscaip/RulesConfigUtil';

import { LodestoneMove } from './LodestoneMove';
import { LodestoneNode } from './LodestoneRules';
import { LodestoneState } from './LodestoneState';

export class LodestoneScoreHeuristic extends PlayerMetricHeuristic<LodestoneMove, LodestoneState> {

    public override getMetrics(node: LodestoneNode, _config: NoConfig): PlayerNumberTable {
        return node.gameState.getScores().toTable();
    }

}
