import { PlayerMetricHeuristic } from '@everyboard/games';
import { PlayerNumberTable } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';

import { YinshMove } from './YinshMove';
import { YinshNode } from './YinshRules';
import { YinshState } from './YinshState';

export class YinshScoreHeuristic extends PlayerMetricHeuristic<YinshMove, YinshState> {

    public override getMetrics(node: YinshNode, _config: EmptyRulesConfig): PlayerNumberTable {
        return node.gameState.sideRings.toTable();
    }

}
