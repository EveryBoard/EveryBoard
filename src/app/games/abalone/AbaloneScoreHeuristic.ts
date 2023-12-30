import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';
import { AbaloneMove } from './AbaloneMove';
import { AbaloneNode } from './AbaloneRules';
import { AbaloneState } from './AbaloneState';

export class AbaloneScoreHeuristic extends PlayerMetricHeuristic<AbaloneMove, AbaloneState> {

    public getMetrics(node: AbaloneNode): PlayerNumberTable {
        const scores: [number, number] = node.gameState.getScores();
        return PlayerNumberTable.of(
            [scores[0]],
            [scores[1]],
        );
    }
}
