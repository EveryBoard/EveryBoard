import { Move } from '../Move';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { GameState } from '../state/GameState';

import { BoardValue } from './BoardValue';
import { GameNode } from './GameNode';

/**
 * A heuristic assigns a specific value for a node.
 * This is used for example by minimax-based AIs.
 * The value assigned to a node can be more than just a number, and is thus a `BoardValue`
 */
export abstract class Heuristic<M extends Move,
                                S extends GameState,
                                B extends BoardValue = BoardValue,
                                C extends RulesConfig = EmptyRulesConfig>
{
    public abstract getBoardValue(node: GameNode<M, S>, config: C): B;
}
