import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { LodestoneMove } from './LodestoneMove';
import { LodestoneNode } from './LodestoneRules';
import { LodestoneState } from './LodestoneState';
import { Player } from 'src/app/jscaip/Player';

export class LodestoneScoreHeuristic extends PlayerMetricHeuristic<LodestoneMove, LodestoneState> {

    public getMetrics(node: LodestoneNode): [number, number] {
        return [
            node.gameState.getScores().get(Player.ZERO).get(),
            node.gameState.getScores().get(Player.ONE).get(),
        ];
    }
}
