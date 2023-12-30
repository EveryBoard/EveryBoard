import { MancalaState } from '../common/MancalaState';
import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';
import { MancalaMove } from './MancalaMove';
import { MancalaNode } from './MancalaRules';
import { MancalaConfig } from './MancalaConfig';

export class MancalaScoreHeuristic extends PlayerMetricHeuristic<MancalaMove, MancalaState, MancalaConfig> {

    public getMetrics(node: MancalaNode): PlayerNumberTable {
        const captured: number[] = node.gameState.getScoresCopy();
        return PlayerNumberTable.of(
            [captured[0]],
            [captured[1]],
        );
    }

}
