import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionNode, LinesOfActionRules } from './LinesOfActionRules';
import { LinesOfActionState } from './LinesOfActionState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { Player } from 'src/app/jscaip/Player';

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
