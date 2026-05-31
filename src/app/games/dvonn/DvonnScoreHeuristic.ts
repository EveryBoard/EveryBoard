import { PlayerMetricHeuristic } from '../../jscaip/AI/PlayerMetricHeuristic';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { EmptyRulesConfig } from '../../jscaip/RulesConfigUtil';

import { DvonnMove } from './DvonnMove';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnState } from './DvonnState';

export class DvonnScoreHeuristic extends PlayerMetricHeuristic<DvonnMove, DvonnState> {

    public override getMetrics(node: DvonnNode, _config: EmptyRulesConfig): PlayerNumberTable {
        // The metric the total number of pieces controlled by a player
        return DvonnRules.getScores(node.gameState).toTable();
    }
}
