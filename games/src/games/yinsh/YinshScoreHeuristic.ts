import { EmptyRulesConfig } from '../../config/RulesConfig';
import { PlayerMetricHeuristic } from '../../jscaip/AI/PlayerMetricHeuristic';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';

import { YinshMove } from './YinshMove';
import { YinshNode } from './YinshRules';
import { YinshState } from './YinshState';

export class YinshScoreHeuristic extends PlayerMetricHeuristic<YinshMove, YinshState> {

    public override getMetrics(node: YinshNode, _config: EmptyRulesConfig): PlayerNumberTable {
        return node.gameState.sideRings.toTable();
    }

}
