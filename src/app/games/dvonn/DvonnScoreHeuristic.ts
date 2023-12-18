import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { DvonnMove } from './DvonnMove';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnState } from './DvonnState';
import { Player } from 'src/app/jscaip/Player';

export class DvonnScoreHeuristic extends PlayerMetricHeuristic<DvonnMove, DvonnState> {

    public getMetrics(node: DvonnNode): [number, number] {
        // The metric the total number of pieces controlled by a player
        return [
            DvonnRules.getScores(node.gameState).get(Player.ZERO).get(),
            DvonnRules.getScores(node.gameState).get(Player.ONE).get(),
        ];
    }
}
