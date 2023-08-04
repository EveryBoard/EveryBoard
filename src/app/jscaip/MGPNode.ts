import { Move } from './Move';
import { MGPMap } from '../utils/MGPMap';
import { MGPOptional } from '../utils/MGPOptional';
import { GameState } from './GameState';
import { Rules } from './Rules';
import { GameStatus } from './GameStatus';
import { Player } from './Player';

export class MGPNodeStats {
    public static createdNodes: number = 0;
    public static minimaxTime: number = 0;
}

/**
 * A node of the game tree.
 * A node has a state, and may have a parent and previous move.
 * This is only a tree datastructure, we don't need any logic in here.
 * As an extra, a node may contain cached values used by AIs.
 */
export class GameNode<M extends Move, S extends GameState> {
    /**
     * The children of this node.
     * It is a map keyed with moves, with as value the child that corresponds to applying that move to the current state.
     */
    private readonly children: MGPMap<M, GameNode<M, S>> = new MGPMap();

    /**
     * A cache that AIs can use. It is up to the AIs to properly name and type the values in the cache.
     */
    private readonly cache: MGPMap<string, NonNullable<unknown>> = new MGPMap();

    public constructor(public readonly gameState: S,
                       public readonly parent: MGPOptional<GameNode<M, S>> = MGPOptional.empty(),
                       public readonly move: MGPOptional<M> = MGPOptional.empty()) {
    }
    /**
     * Returns the child corresponding to applying the given move to the current state,
     * or empty if it has not yet been calculated.
     */
    public getChild(move: M): MGPOptional<GameNode<M, S>> {
        return this.children.get(move);
    }
    /**
     * Checks whether this node has children
     */
    public hasChildren(): boolean {
        return this.getChildren().length > 0;
    }
    /**
     * Returns all the children of the node
     */
    public getChildren(): GameNode<M, S>[] {
        return this.children.listValues();
    }
    /**
     * Adds a child to this node.
     */
    public addChild(move: M, node: GameNode<M, S>): void {
        this.children.set(move, node);
    }
    /**
     * Represents the tree starting at this node as a DOT graph.
     * You can view the DOT graph with a tool like xdot,
     * or by pasting it on a website like https://dreampuf.github.io/GraphvizOnline/
     */
    public printDot<L>(rules: Rules<M, S, L>, level: number = 0, max?: number, id: number = 0): number {
        if (level === 0) {
            console.log('digraph G {');
        }
        const gameStatus: GameStatus = rules.getGameStatus(this);
        let color: string = "white";
        if (gameStatus.isEndGame) {
            switch (gameStatus.winner) {
                case Player.ZERO:
                    color = "#994d00";
                    break;
                case Player.ONE:
                    color = "#ffc34d";
                    break;
                default:
                    color = "grey";
                    break;
            }
        }
        console.log(`    node_${id} [label="#${this.gameState.turn}", style=filled, fillcolor="${color}"];`);

        let nextId: number = id+1;
        if (max === undefined || level < max) {
            for (const child of this.children.listValues()) {
                console.log(`    node_${id} -> node_${nextId} [label="${child.move.get()}"];`);
                nextId = child.printDot(rules, level+1, max, nextId);
            }
        }
        if (level === 0) {
            console.log('}');
        }
        return nextId;
    }
    /**
     * Get a value from the cache, or MGPOptional if it does not exist in the cache.
     */
    public getCache<T>(key: string): MGPOptional<T> {
        return this.cache.get(key) as MGPOptional<T>;
    }
    /**
     * Set or replace a value from the cache.
     */
    public setCache(key: NonNullable<string>, value: NonNullable<unknown>) {
        if (this.cache.containsKey(key)) {
            this.cache.replace(key, value);
        } else {
            this.cache.set(key, value);
        }
    }
}

export class AbstractNode extends GameNode<Move, GameState> {}

/**
 * A move generator should have a method that generates move from a node.
 * It may generate all possible moves, but may also just filter out some uninteresting moves.
 */
export abstract class MoveGenerator<M extends Move, S extends GameState> {
    /**
     * Gives the list of all the possible moves.
     * Has to be implemented for each rule so that the AI can choose among theses moves.
     * This function could give an incomplete set of data if some of them are redundant
     * or if some of them are too bad to be interesting to count, as a matter of performance.
     */
    public abstract getListMoves(node: GameNode<M, S>): M[];
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
 * These are options for AI that can be iteration-constrained, such as MCTS.
 */
export type AIIterationLimitOptions = AIOptions & {
    readonly maxIterations: number;
}

/**
 * An AI selects a move from a game node.
 */
export abstract class AI<M extends Move, S extends GameState, Opts extends AIOptions> {
    public abstract readonly name: string;
    public abstract readonly availableOptions: Opts[];
    public abstract chooseNextMove(node: GameNode<M, S>, options: Opts): M;
}

export abstract class AbstractAI extends AI<Move, GameState, AIOptions> {
}
