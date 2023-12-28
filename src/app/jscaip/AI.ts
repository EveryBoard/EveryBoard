import { MGPOptional } from '../utils/MGPOptional';
import { GameNode } from './GameNode';
import { GameState } from './GameState';
import { Move } from './Move';
import { EmptyRulesConfig, RulesConfig } from './RulesConfigUtil';

/**
 * A move generator should have a method that generates move from a node.
 * It may generate all possible moves, but may also just filter out some uninteresting moves.
 * It may also order moves from more interesting to less interesting.
 */
export abstract class MoveGenerator<M extends Move, S extends GameState, C extends RulesConfig = EmptyRulesConfig> {
    /**
     * Gives the list of all the possible moves.
     * Has to be implemented for each rule so that the AI can choose among theses moves.
     * This function could give an incomplete set of data if some of them are redundant
     * or if some of them are too bad to be interesting to count, as a matter of performance.
     */
    public abstract getListMoves(node: GameNode<M, S>, config: MGPOptional<C>): M[];
}

/**
 * Most AIs can be parameterized. This is where the parameters would be stored.
 */
export type AIOptions = {
    readonly name: string;
}

/**
 * These are options for AIs that have a depth limit, such as minimax.
 */
export type AIDepthLimitOptions = AIOptions & {
    readonly maxDepth: number;
}

/**
 * These are options for AI that can be time-constrained, such as MCTS.
 */
export type AITimeLimitOptions = AIOptions & {
    readonly maxSeconds: number;
}

export class AIStats {
    public static aiTime: number = 0;
}
/**
 * An AI selects a move from a game node.
 */
export abstract class AI<M extends Move,
                         S extends GameState,
                         O extends AIOptions,
                         C extends RulesConfig = EmptyRulesConfig>
{
    public abstract readonly name: string;
    public abstract readonly availableOptions: O[];

    // This lets the AI choose the next move to play, given a game node and some options
    public abstract chooseNextMove(node: GameNode<M, S>, options: O, config: MGPOptional<C>): M;

    // This returns useful information to display on the local game page for developers
    public abstract getInfo(node: GameNode<M, S>, config: MGPOptional<C>): string;

}

export abstract class AbstractAI extends AI<Move, GameState, AIOptions, RulesConfig> {
}
