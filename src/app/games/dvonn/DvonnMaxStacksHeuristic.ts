import { Coord } from 'src/app/jscaip/Coord';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { DvonnMove } from './DvonnMove';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnState } from './DvonnState';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

export class DvonnMaxStacksHeuristic extends PlayerMetricHeuristic<DvonnMove, DvonnState> {

    public getMetrics(node: DvonnNode): [number, number] {
        const state: DvonnState = node.gameState;
        // The metric is percentage of the stacks controlled by the player
        const scores: PlayerNumberMap = DvonnRules.getScores(state);
        const pieces: Coord[] = state.getAllPieces();
        const numberOfStacks: number = pieces.length;
        for (const player of Player.PLAYERS) {
            const playerStacks: number = pieces.filter((c: Coord): boolean =>
                state.getPieceAt(c).belongsTo(player)).length;
            const oldScore: number = scores.get(player).get();
            scores.put(player, oldScore * playerStacks / numberOfStacks);
        }
        return [
            scores.get(Player.ZERO).get(),
            scores.get(Player.ONE).get(),
        ];
    }
}
