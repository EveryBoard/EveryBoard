import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';
import { DvonnMove } from './DvonnMove';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnState } from './DvonnState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class DvonnScoreHeuristic extends PlayerMetricHeuristic<DvonnMove, DvonnState> {

    public override getMetrics(node: DvonnNode, _config: NoConfig): PlayerNumberTable {
        // The metric the total number of pieces controlled by a player
        const scores: [number, number] = DvonnRules.getScores(node.gameState);
        return PlayerNumberTable.of(
            [scores[0]],
            [scores[1]],
        );
    }
}
