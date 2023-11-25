import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { GipfMove } from './GipfMove';
import { GipfNode, GipfRules } from './GipfRules';
import { GipfState } from './GipfState';
import { MGPMap } from 'src/app/utils/MGPMap';

export class GipfScoreHeuristic extends PlayerMetricHeuristic<GipfMove, GipfState> {

    public getMetrics(node: GipfNode): MGPMap<Player, ReadonlyArray<number>> {
        const state: GipfState = node.gameState;
        return new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [GipfRules.getPlayerScore(state, Player.ZERO).get()] },
            { key: Player.ONE, value: [GipfRules.getPlayerScore(state, Player.ONE).get()] },
        ]);
    }
}
