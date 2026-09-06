import { EmptyRulesConfig } from '../../config/RulesConfig';
import { PlayerMetricHeuristic } from '../../jscaip/AI/PlayerMetricHeuristic';
import { Coord } from '../../jscaip/Coord';
import { Player } from '../../jscaip/Player';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';

import { DvonnMove } from './DvonnMove';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnState } from './DvonnState';

export class DvonnMaxStacksHeuristic extends PlayerMetricHeuristic<DvonnMove, DvonnState> {

    public override getMetrics(node: DvonnNode, _config: EmptyRulesConfig): PlayerNumberTable {
        const state: DvonnState = node.gameState;
        // The metric is percentage of the stacks controlled by the player
        const scores: PlayerNumberMap = DvonnRules.getScores(state);
        const metrics: PlayerNumberTable = new PlayerNumberTable();
        const pieces: Coord[] = state.getAllPieces();
        const numberOfStacks: number = pieces.length;
        for (const player of Player.PLAYERS) {
            const playerStacks: number = pieces.filter((c: Coord): boolean =>
                state.getPieceAt(c).belongsTo(player)).length;
            const oldScore: number = scores.get(player);
            metrics.set(player, [oldScore * playerStacks / numberOfStacks]);
        }
        return metrics;
    }

}
