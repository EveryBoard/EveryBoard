import { MancalaState } from '../common/MancalaState';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { MancalaMove } from './MancalaMove';
import { MancalaNode } from './MancalaRules';
import { MancalaConfig } from './MancalaConfig';

export class MancalaScoreHeuristic extends PlayerMetricHeuristic<MancalaMove, MancalaState, MancalaConfig> {

    public getMetrics(node: MancalaNode): [number, number] {
        const captured: number[] = node.gameState.getScoresCopy();
        return [captured[0], captured[1]];
    }

}
