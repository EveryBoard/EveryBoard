import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { GipfMove } from './GipfMove';
import { GipfNode, GipfRules } from './GipfRules';
import { GipfState } from './GipfState';

export class GipfScoreHeuristic extends PlayerMetricHeuristic<GipfMove, GipfState> {

    public getMetrics(node: GipfNode): PlayerNumberTable {
        const state: GipfState = node.gameState;
        return PlayerNumberTable.of(
            [GipfRules.getPlayerScore(state, Player.ZERO).get()],
            [GipfRules.getPlayerScore(state, Player.ONE).get()],
        );
    }
}
