import { KalahMove } from './KalahMove';
import { MancalaState } from './../common/MancalaState';
import { KalahNode } from './KalahRules';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';

export class KalahScoreHeuristic extends PlayerMetricHeuristic<KalahMove, MancalaState> {

    public getMetrics(node: KalahNode): [number, number] {
        return node.gameState.getScoresCopy();
    }
}
