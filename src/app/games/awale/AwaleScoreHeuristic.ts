import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { AwaleMove } from './AwaleMove';
import { AwaleNode } from './AwaleRules';
import { AwaleState } from './AwaleState';

export class AwaleScoreHeuristic extends PlayerMetricHeuristic<AwaleMove, AwaleState> {

    public getMetrics(node: AwaleNode): [number, number] {
        const captured: number[] = node.gameState.getCapturedCopy();
        return [captured[0], captured[1]];
    }
}
