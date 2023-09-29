import { MancalaState } from '../common/MancalaState';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { MancalaMove } from './MancalaMove';
import { GameNode } from 'src/app/jscaip/GameNode';

export class MancalaScoreHeuristic<M extends MancalaMove> extends PlayerMetricHeuristic<M, MancalaState> {
    public getMetrics(node: GameNode<M, MancalaState>): [number, number] {
        const captured: number[] = node.gameState.getScoresCopy();
        return [captured[0], captured[1]];
    }
}
