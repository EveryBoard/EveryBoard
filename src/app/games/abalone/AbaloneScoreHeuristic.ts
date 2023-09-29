import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { AbaloneMove } from './AbaloneMove';
import { AbaloneNode } from './AbaloneRules';
import { AbaloneState } from './AbaloneState';

export class AbaloneScoreHeuristic extends PlayerMetricHeuristic<AbaloneMove, AbaloneState> {

    public getMetrics(node: AbaloneNode): [number, number] {
        return node.gameState.getScores();
    }
}
