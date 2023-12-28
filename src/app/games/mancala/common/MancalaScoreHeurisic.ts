import { MancalaState } from '../common/MancalaState';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { MancalaMove } from './MancalaMove';
import { GameNode } from 'src/app/jscaip/GameNode';
import { PlayerMap } from 'src/app/jscaip/PlayerMap';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MancalaConfig } from './MancalaConfig';

export class MancalaScoreHeuristic<M extends MancalaMove>
    extends PlayerMetricHeuristic<M, MancalaState, MancalaConfig>
{

    public getMetrics(node: GameNode<M, MancalaState>, _config: MGPOptional<MancalaConfig>): [number, number] {
        const captured: PlayerMap<number> = node.gameState.getScoresCopy();
        return [
            captured.get(Player.ZERO).get(),
            captured.get(Player.ONE).get(),
        ];
    }

}
