import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';
import { DvonnMove } from './DvonnMove';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnState } from './DvonnState';

export class DvonnScoreHeuristic extends PlayerMetricHeuristic<DvonnMove, DvonnState> {

    public getMetrics(node: DvonnNode): PlayerNumberTable {
        // The metric the total number of pieces controlled by a player
        const scores: [number, number] = DvonnRules.getScores(node.gameState);
        return PlayerNumberTable.of(
            [scores[0]],
            [scores[1]],
        );
    }
}
