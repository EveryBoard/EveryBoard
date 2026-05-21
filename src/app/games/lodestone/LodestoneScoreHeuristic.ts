import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { EmptyRulesConfig } from '../../jscaip/RulesConfigUtil';

import { LodestoneMove } from './LodestoneMove';
import { LodestoneNode } from './LodestoneRules';
import { LodestoneState } from './LodestoneState';

export class LodestoneScoreHeuristic extends PlayerMetricHeuristic<LodestoneMove, LodestoneState> {

    public override getMetrics(node: LodestoneNode, _config: EmptyRulesConfig): PlayerNumberTable {
        return node.gameState.getScores().toTable();
    }

}
