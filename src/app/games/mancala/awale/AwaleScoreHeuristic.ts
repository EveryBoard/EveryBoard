import { MancalaState } from '../common/MancalaState';
import { AwaleMove } from './AwaleMove';
import { AwaleNode } from './AwaleRules';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';

export class AwaleScoreHeuristic extends PlayerMetricHeuristic<AwaleMove, MancalaState> {
    public getMetrics(node: AwaleNode): [number, number] {
        const captured: number[] = node.gameState.getScoresCopy();
        return [captured[0], captured[1]];
    }
}
