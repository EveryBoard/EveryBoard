import { MancalaState } from '../common/MancalaState';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { MancalaMove } from './MancalaMove';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { MGPMap } from 'src/app/utils/MGPMap';
import { Player } from 'src/app/jscaip/Player';

export class MancalaScoreHeuristic<M extends MancalaMove> extends PlayerMetricHeuristic<M, MancalaState> {

    public getMetrics(node: GameNode<M, MancalaState>): MGPMap<Player, ReadonlyArray<number>> {
        const captured: number[] = node.gameState.getScoresCopy();
        return new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [captured[0]] },
            { key: Player.ONE, value: [captured[1]] },
        ]);
    }

}
