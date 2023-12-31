import { YinshState } from './YinshState';
import { YinshMove } from './YinshMove';
import { YinshNode } from './YinshRules';
import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class YinshScoreHeuristic extends PlayerMetricHeuristic<YinshMove, YinshState> {

    public override getMetrics(node: YinshNode, _config: NoConfig): PlayerNumberTable {
        return PlayerNumberTable.of(
            [node.gameState.sideRings[0]],
            [node.gameState.sideRings[1]],
        );
    }
}
