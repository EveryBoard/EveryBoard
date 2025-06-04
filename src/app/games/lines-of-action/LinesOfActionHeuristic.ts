import { PlayerMetricHeuristic } from '../../../app/jscaip/AI/Minimax';
import { PlayerNumberTable } from '../../../app/jscaip/PlayerNumberTable';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionNode, LinesOfActionRules } from './LinesOfActionRules';
import { LinesOfActionState } from './LinesOfActionState';
import { NoConfig } from '../../../app/jscaip/RulesConfigUtil';
import { PlayerNumberMap } from '../../../app/jscaip/PlayerMap';
import { Player } from '../../../app/jscaip/Player';

export class LinesOfActionHeuristic extends PlayerMetricHeuristic<LinesOfActionMove, LinesOfActionState> {

    public override getMetrics(node: LinesOfActionNode, _config: NoConfig): PlayerNumberTable {
        const state: LinesOfActionState = node.gameState;
        const scores: PlayerNumberMap = LinesOfActionRules.getNumberOfGroups(state);
        // More groups = less score
        return PlayerNumberTable.ofSingle(
            100 / scores.get(Player.ZERO),
            100 / scores.get(Player.ONE),
        );
    }
}
