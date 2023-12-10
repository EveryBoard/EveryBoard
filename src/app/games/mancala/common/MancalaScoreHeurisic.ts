import { MancalaState } from '../common/MancalaState';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { MancalaMove } from './MancalaMove';
import { MGPMap } from 'src/app/utils/MGPMap';
import { Player } from 'src/app/jscaip/Player';
import { MancalaNode } from './MancalaRules';
import { MancalaConfig } from './MancalaConfig';

export class MancalaScoreHeuristic extends PlayerMetricHeuristic<MancalaMove, MancalaState, MancalaConfig> {

    public getMetrics(node: MancalaNode): MGPMap<Player, ReadonlyArray<number>> {
        const captured: number[] = node.gameState.getScoresCopy();
        return new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [captured[0]] },
            { key: Player.ONE, value: [captured[1]] },
        ]);
    }

}
