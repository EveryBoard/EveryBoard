import { Coord } from '../../../app/jscaip/Coord';
import { PlayerMetricHeuristic } from '../../../app/jscaip/AI/Minimax';
import { PlayerNumberTable } from '../../../app/jscaip/PlayerNumberTable';
import { Player } from '../../../app/jscaip/Player';
import { DvonnMove } from './DvonnMove';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnState } from './DvonnState';
import { PlayerNumberMap } from '../../../app/jscaip/PlayerMap';
import { NoConfig } from '../../../app/jscaip/RulesConfigUtil';

export class DvonnMaxStacksHeuristic extends PlayerMetricHeuristic<DvonnMove, DvonnState> {

    public override getMetrics(node: DvonnNode, _config: NoConfig): PlayerNumberTable {
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
