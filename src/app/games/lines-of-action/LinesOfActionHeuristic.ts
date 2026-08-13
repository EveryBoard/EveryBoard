import { Player } from '@everyboard/games';

import { PlayerMetricHeuristic } from '../../jscaip/AI/PlayerMetricHeuristic';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { EmptyRulesConfig } from '../../jscaip/RulesConfigUtil';

import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionNode, LinesOfActionRules } from './LinesOfActionRules';
import { LinesOfActionState } from './LinesOfActionState';

export class LinesOfActionHeuristic extends PlayerMetricHeuristic<LinesOfActionMove, LinesOfActionState> {

    public override getMetrics(node: LinesOfActionNode, _config: EmptyRulesConfig): PlayerNumberTable {
        const state: LinesOfActionState = node.gameState;
        const scores: PlayerNumberMap = LinesOfActionRules.getNumberOfGroups(state);
        // More groups = less score
        return PlayerNumberTable.ofSingle(
            100 / scores.get(Player.ZERO),
            100 / scores.get(Player.ONE),
        );
    }
}
