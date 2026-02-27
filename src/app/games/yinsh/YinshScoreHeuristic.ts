import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { NoConfig } from '../../jscaip/RulesConfigUtil';

import { YinshMove } from './YinshMove';
import { YinshNode } from './YinshRules';
import { YinshState } from './YinshState';

export class YinshScoreHeuristic extends PlayerMetricHeuristic<YinshMove, YinshState> {

    public override getMetrics(node: YinshNode, _config: NoConfig): PlayerNumberTable {
        return node.gameState.sideRings.toTable();
    }

}
