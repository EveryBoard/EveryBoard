import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { LodestoneMove } from './LodestoneMove';
import { LodestoneNode } from './LodestoneRules';
import { LodestoneState } from './LodestoneState';


export class LodestoneScoreHeuristic extends PlayerMetricHeuristic<LodestoneMove, LodestoneState> {

    public getMetrics(node: LodestoneNode): [number, number] {
        return node.gameState.getScores();
    }
}
