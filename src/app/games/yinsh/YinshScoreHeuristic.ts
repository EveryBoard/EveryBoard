import { YinshState } from './YinshState';
import { YinshMove } from './YinshMove';
import { YinshNode } from './YinshRules';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';

export class YinshScoreHeuristic extends PlayerMetricHeuristic<YinshMove, YinshState> {

    public getMetrics(node: YinshNode): [number, number] {
        return [
            node.gameState.sideRings.get(Player.ZERO).get(),
            node.gameState.sideRings.get(Player.ONE).get(),
        ];
    }
}
