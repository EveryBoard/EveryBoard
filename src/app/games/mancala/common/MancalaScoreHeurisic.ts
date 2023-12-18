import { MancalaState } from '../common/MancalaState';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { MancalaMove } from './MancalaMove';
import { GameNode } from 'src/app/jscaip/GameNode';
import { PlayerMap } from 'src/app/jscaip/PlayerMap';
import { Player } from 'src/app/jscaip/Player';

export class MancalaScoreHeuristic<M extends MancalaMove> extends PlayerMetricHeuristic<M, MancalaState> {

    public getMetrics(node: GameNode<M, MancalaState>): [number, number] {
        const captured: PlayerMap<number> = node.gameState.getScoresCopy();
        return [
            captured.get(Player.ZERO).get(),
            captured.get(Player.ONE).get(),
        ];
    }

}
