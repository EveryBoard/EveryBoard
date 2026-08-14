import { Player } from '@everyboard/games';

import { Move } from '../Move';
import { PlayerNumberTable } from '../PlayerNumberTable';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { GameState } from '../state/GameState';

import { BoardValue } from './BoardValue';
import { GameNode } from './GameNode';
import { Heuristic } from './Heuristic';

export abstract class PlayerMetricHeuristic<M extends Move,
                                            S extends GameState,
                                            C extends RulesConfig = EmptyRulesConfig>
    extends Heuristic<M, S, BoardValue, C>
{
    public abstract getMetrics(node: GameNode<M, S>, config: C): PlayerNumberTable;

    public getBoardValue(node: GameNode<M, S>, config: C): BoardValue {
        const metrics: PlayerNumberTable = this.getMetrics(node, config);
        return BoardValue.ofMultiple(
            metrics.get(Player.ZERO).get(),
            metrics.get(Player.ONE).get(),
        );
    }

}
