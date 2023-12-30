import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';
import { LodestoneMove } from './LodestoneMove';
import { LodestoneNode } from './LodestoneRules';
import { LodestoneState } from './LodestoneState';

export class LodestoneScoreHeuristic extends PlayerMetricHeuristic<LodestoneMove, LodestoneState> {

    public getMetrics(node: LodestoneNode): PlayerNumberTable {
        const scores: [number, number] = node.gameState.getScores();
        return PlayerNumberTable.of(
            [scores[0]],
            [scores[1]],
        );
    }

}
