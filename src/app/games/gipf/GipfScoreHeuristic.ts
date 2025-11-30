import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { Player } from '../../jscaip/Player';
import { GipfMove } from './GipfMove';
import { GipfNode, GipfRules } from './GipfRules';
import { GipfState } from './GipfState';
import { NoConfig } from '../../jscaip/RulesConfigUtil';

export class GipfScoreHeuristic extends PlayerMetricHeuristic<GipfMove, GipfState> {

    public override getMetrics(node: GipfNode, _config: NoConfig): PlayerNumberTable {
        const state: GipfState = node.gameState;
        return PlayerNumberTable.ofSingle(
            GipfRules.getPlayerScore(state, Player.ZERO).get(),
            GipfRules.getPlayerScore(state, Player.ONE).get(),
        );
    }
}
