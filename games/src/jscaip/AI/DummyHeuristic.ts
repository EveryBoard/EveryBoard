import { EmptyRulesConfig, RulesConfig } from '../../config/RulesConfig';
import { Move } from '../Move';
import { PlayerNumberTable } from '../PlayerNumberTable';
import { GameState } from '../state/GameState';

import { GameNode } from './GameNode';
import { PlayerMetricHeuristic } from './PlayerMetricHeuristic';

export class DummyHeuristic<M extends Move, S extends GameState, C extends RulesConfig = EmptyRulesConfig>
    extends PlayerMetricHeuristic<M, S, C>
{

    public override getMetrics(_node: GameNode<M, S>, _config?: C): PlayerNumberTable {
        // This is really a dummy heuristic: boards have no value
        return PlayerNumberTable.ofSingle(0, 0);
    }

}
