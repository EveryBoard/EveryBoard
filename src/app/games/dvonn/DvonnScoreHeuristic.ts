import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { DvonnMove } from './DvonnMove';
import { DvonnNode, DvonnRules } from './DvonnRules';
import { DvonnState } from './DvonnState';
import { MGPMap } from 'src/app/utils/MGPMap';
import { Player } from 'src/app/jscaip/Player';

export class DvonnScoreHeuristic extends PlayerMetricHeuristic<DvonnMove, DvonnState> {

    public getMetrics(node: DvonnNode): MGPMap<Player, ReadonlyArray<number>> {
        // The metric the total number of pieces controlled by a player
        const scores: [number, number] = DvonnRules.getScores(node.gameState);
        return new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [scores[0]] },
            { key: Player.ONE, value: [scores[1]] },
        ]);
    }
}
