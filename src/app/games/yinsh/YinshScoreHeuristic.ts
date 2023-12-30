import { YinshState } from './YinshState';
import { YinshMove } from './YinshMove';
import { YinshNode } from './YinshRules';
import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';

export class YinshScoreHeuristic extends PlayerMetricHeuristic<YinshMove, YinshState> {

    public getMetrics(node: YinshNode): PlayerNumberTable {
        return PlayerNumberTable.of(
            [node.gameState.sideRings[0]],
            [node.gameState.sideRings[1]],
        );
    }
}
