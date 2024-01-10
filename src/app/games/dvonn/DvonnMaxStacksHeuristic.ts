import { Coord } from 'src/app/jscaip/Coord';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { Player } from 'src/app/jscaip/Player';
import { DvonnMove } from './DvonnMove';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnState } from './DvonnState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class DvonnMaxStacksHeuristic extends PlayerMetricHeuristic<DvonnMove, DvonnState> {

    public override getMetrics(node: DvonnNode, _config: NoConfig): PlayerNumberTable {
        const state: DvonnState = node.gameState;
        // The metric is percentage of the stacks controlled by the player
        const scores: [number, number] = DvonnRules.getScores(state);
        const metrics: PlayerNumberTable = new PlayerNumberTable();
        const pieces: Coord[] = state.getAllPieces();
        const numberOfStacks: number = pieces.length;
        for (const player of Player.PLAYERS) {
            const playerStacks: number = pieces.filter((c: Coord): boolean =>
                state.getPieceAt(c).belongsTo(player)).length;
            metrics.set(player, [scores[player.value] * playerStacks / numberOfStacks]);
        }
        return metrics;
    }

}
