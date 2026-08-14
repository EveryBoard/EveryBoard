import { Player } from '@everyboard/games';
import { PlayerMetricHeuristic } from '@everyboard/games';
import { PlayerNumberTable } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';

import { GipfMove } from './GipfMove';
import { GipfNode, GipfRules } from './GipfRules';
import { GipfState } from './GipfState';

export class GipfScoreHeuristic extends PlayerMetricHeuristic<GipfMove, GipfState> {

    public override getMetrics(node: GipfNode, _config: EmptyRulesConfig): PlayerNumberTable {
        const state: GipfState = node.gameState;
        return PlayerNumberTable.ofSingle(
            GipfRules.getPlayerScore(state, Player.ZERO).get(),
            GipfRules.getPlayerScore(state, Player.ONE).get(),
        );
    }
}
