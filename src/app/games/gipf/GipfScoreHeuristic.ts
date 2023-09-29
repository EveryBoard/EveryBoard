import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { GipfMove } from './GipfMove';
import { GipfNode, GipfRules } from './GipfRules';
import { GipfState } from './GipfState';

export class GipfScoreHeuristic extends PlayerMetricHeuristic<GipfMove, GipfState> {

    public getMetrics(node: GipfNode): [number, number] {
        const state: GipfState = node.gameState;
        return [
            GipfRules.getPlayerScore(state, Player.ZERO).get(),
            GipfRules.getPlayerScore(state, Player.ONE).get(),
        ];
    }
}
