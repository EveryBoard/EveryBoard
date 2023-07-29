import { Move } from './Move';
import { SCORE } from './SCORE';
import { Rules } from './Rules';
import { MGPMap } from '../utils/MGPMap';
import { display, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { BoardValue } from './BoardValue';
import { Minimax } from './Minimax';
import { MGPSet } from '../utils/MGPSet';
import { MGPOptional } from '../utils/MGPOptional';
import { Player } from './Player';
import { GameState } from './GameState';
import { MGPFallible } from '../utils/MGPFallible';
import { MCTS } from './MCTS';
import { ArrayUtils } from '../utils/ArrayUtils';

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
    private readonly cache: MGPMap<string, object> = new MGPMap();

    public constructor(public readonly gameState: S,
                       public readonly parent: MGPOptional<GameNode<M, S>> = MGPOptional.empty(),
                       public readonly move: MGPOptional<M> = MGPOptional.empty()) {
    }
    /**
     * Return the child corresponding to applying the given move to the current state,
     * or empty if it has not yet been calculated.
     */
    public getChild(move: M): MGPOptional<GameNode<M, S>> {
        return this.children.get(move);
    }
    /**
     * Adds a child to this node.
     */
    public addChild(move: M, node: GameNode<M, S>): void {
        this.children.set(move, node);
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
    public setCache(key: string, value: object) {
        this.cache.set(key, value);
    }
}

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
export interface AIOptions {
}

/**
 * These are options for AIs that have a depth limit, such as minimax.
 */
export class AIDepthLimitOptions implements AIOptions {
    public readonly maxDepth: number;
}

/**
 * These are options for AI that can be iteration-constrained, such as MCTS.
 */
export class AIIterationLimitOptions implements AIOptions {
    public readonly maxIterations: number;
}

/**
 * An AI selects a move from a game node.
 */
export abstract class AI<M extends Move, S extends GameState, Opts extends AIOptions> {
    public abstract chooseNextMove(node: GameNode<M, S>, options: Opts): M;
}

/**
 * A heuristic assigns a specific value for a node.
 * This is used for example by minimax-based AIs.
 * The value assigned to a node can be more than just a number, and is thus a `BoardValue`
 */
export abstract class Heuristic<M extends Move, S extends GameState, B extends BoardValue = BoardValue> {
    public abstract getBoardValue(node: GameNode<M, S>): B;
}

/**
 * This implements the minimax algorithm with alpha-beta pruning.
 */
export class MinimaxAI<M extends Move, S extends GameState, B extends BoardValue = BoardValue,L = void> implements AI<M, S, AIDepthLimitOptions> {
    // States whether the minimax takes random moves from the list of best moves.
    private readonly RANDOM: boolean = false;
    // States whether alpha-beta pruning must be done. It probably is never useful to set it to false.
    private readonly PRUNE: boolean = true;

    public constructor(public readonly name: string,
                       private readonly rules: Rules<M, S, L>,
                       private readonly heuristic: Heuristic<M, S, B>,
                       private readonly moveGenerator: MoveGenerator<M, S>) {
    }
    public chooseNextMove(node: GameNode<M, S>, options: AIDepthLimitOptions): M {
        Utils.assert(this.rules.getGameStatus(node).isEndGame === false, 'MinimaxAI has been asked to choose a move from a finished game');
        let bestDescendant: GameNode<M, S> = this.alphaBeta(node,
                                                            options.maxDepth,
                                                            Number.MIN_SAFE_INTEGER,
                                                            Number.MAX_SAFE_INTEGER);
        while (bestDescendant.gameState.turn > node.gameState.turn + 1) {
            bestDescendant = bestDescendant.parent.get();
        }
        return bestDescendant.move.get();
    }

    public alphaBeta(node: GameNode<M, S>, depth: number, alpha: number, beta: number): GameNode<M, S> {
        // const LOCAL_VERBOSE: boolean = false;
        if (depth < 1) {
            // display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'isLeaf-Calculation : ' + this.myToString() + ' at depth ' + depth);
            return node; // leaf by calculation
        } else if (this.rules.getGameStatus(node).isEndGame) {
            // display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'isLeaf-EndGame(' + minimax.ruler.getGameStatus(this).winner.toString() + ') : ' + this.myToString() + ' at depth ' + depth);
            return node; // rules - leaf or calculation - leaf
        }
        const possibleMoves: MGPSet<M> = this.getPossibleMoves(node);
        Utils.assert(possibleMoves.size() > 0, 'Minimax ' + this.name + ' should give move, received none!');
        const bestChildren: GameNode< M, S>[] = this.getBestChildren(node, possibleMoves, depth, alpha, beta);
        const bestChild: GameNode<M, S> = this.getBestChildAmong(bestChildren);
        const bestChildScore: B = this.getScore(bestChild);
        this.setScore(node, bestChildScore);
        return bestChild;
    }
    private getPossibleMoves(node: GameNode<M, S>): MGPSet<M> {
        const currentMoves: MGPOptional<MGPSet<M>> = this.getMoves(node);
        if (currentMoves.isAbsent()) {
            const moves: M[] = this.moveGenerator.getListMoves(node);
            this.setMoves(node, new MGPSet(moves));
            return new MGPSet(moves);
        } else {
            return currentMoves.get();
        }
    }
    private getBestChildren(node: GameNode<M, S>,
                            possibleMoves: MGPSet<M>,
                            depth: number,
                            alpha: number,
                            beta: number)
    : GameNode<M, S>[]
    {
        let bestChildren: GameNode<M, S>[] = [];
        const currentPlayer: Player = node.gameState.getCurrentPlayer();
        let extremumExpected: number =
            currentPlayer === Player.ZERO ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
        const newValueIsBetter: (newValue: number, currentValue: number) => boolean =
            currentPlayer === Player.ZERO ?
                ((a: number, b: number): boolean => a < b) :
                ((a: number, b: number): boolean => b < a);
        for (const move of possibleMoves) {
            const child: GameNode<M, S> = this.getOrCreateChild(node, move);
            const bestChildDescendant: GameNode<M, S> = this.alphaBeta(child, depth - 1, alpha, beta);
            const bestChildValue: number = this.getScore(bestChildDescendant).value;
            if (newValueIsBetter(bestChildValue, extremumExpected) || bestChildren.length === 0) {
                extremumExpected = bestChildValue;
                bestChildren = [bestChildDescendant];
            } else if (bestChildValue === extremumExpected) {
                bestChildren.push(bestChildDescendant);
            }
            if (this.PRUNE && newValueIsBetter(extremumExpected, currentPlayer === Player.ZERO ? alpha : beta)) {
                // cut-off, no need to explore the other childs
                break;
            }
            if (currentPlayer === Player.ZERO) {
                beta = Math.min(extremumExpected, beta);
            } else {
                alpha = Math.max(extremumExpected, alpha);
            }
        }
        return bestChildren;
    }
    private getBestChildAmong(bestChildren: GameNode<M, S>[]): GameNode<M, S> {
        if (this.RANDOM) {
            return ArrayUtils.getRandomElement(bestChildren);
        } else {
            return bestChildren[0];
        }
    }
    private getOrCreateChild(node: GameNode<M, S>, move: M): GameNode<M, S> {
        let child: MGPOptional<GameNode<M, S>> = node.getChild(move);
        if (child.isAbsent()) {
            const legality: MGPFallible<L> = this.rules.isLegal(move, node.gameState);
            const moveString: string = move.toString();
            assert(legality.isSuccess(), 'The minimax "' + this.name + '" has proposed an illegal move (' + moveString + '), refusal reason: ' + legality.getReasonOr('') + ' this should not happen.');
            const state: S = this.rules.applyLegalMove(move, node.gameState, legality.get());
            const newChild = new GameNode(state, MGPOptional.of(node), MGPOptional.of(move));
            node.addChild(move, newChild)
            this.setScore(newChild, this.heuristic.getBoardValue(newChild));
            return newChild;
        }
        return child.get();
    }
    private setScore(node: GameNode<M, S>, score: B): void {
        node.setCache(this.name + '-score', score);
    }
    private getScore(node: GameNode<M, S>): B {
        // Scores are created during node creation, so they are always present
        return node.getCache<B>(this.name + '-score').get();
    }
    private setMoves(node: GameNode<M, S>, moves: MGPSet<M>): void {
        node.setCache(this.name + '-moves', moves);
    }
    private getMoves(node: GameNode<M, S>): MGPOptional<MGPSet<M>> {
        return node.getCache(this.name + '-moves');
    }
}

export class MGPNode<R extends Rules<M, S, L>,
                     M extends Move,
                     S extends GameState,
                     L = void,
                     B extends BoardValue = BoardValue> {

    public static VERBOSE: boolean = false;

                         // TODO: Minimax should become AI<Move, GameState>
    public static minimaxes: MGPMap<string, Minimax<Move, GameState>> = new MGPMap();

    private childs: MGPOptional<MGPNode<R, M, S, L, B>[]> = MGPOptional.empty();
    /* empty if we did not create potential children of a node, hence also if it is a leaf (depth = 0)
    *
    * an empty ArrayList if it is the end of the game (and then a leaf)
    *
    * otherwise, an ArrayList of all nodes that we can obtain from this node.
    */

                         // TODO: move into MinimaxAI
    private readonly hopedValue: MGPMap<string, number> = new MGPMap();
    /* key is the name of the Minimax
     * value: if it's a leaf: its own board value
     * else: the board value of this node best descendant
     */

    private readonly ownValue: MGPMap<string, B> = new MGPMap();

                         // TODO: keep it for the moment, maybe name it "cachedMoves"
    private readonly possibleMoves: MGPMap<string, MGPSet<M>> = new MGPMap();
    /* Can contain more move than childs, in case of pruning
     * should be only calculated once
     */

                         // TODO: probably better somewhere else?
    public static getScoreStatus(score: number): SCORE {
        /* the score status is VICTORY if the score is minValue or MaxValue,
         * because it's how we encode the boardValue if there's a victory
         */
        const LOCAL_VERBOSE: boolean = false;
        if (score === Number.MAX_SAFE_INTEGER) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'VICTORY');
            return SCORE.VICTORY;
        }
        if (score === Number.MIN_SAFE_INTEGER) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'VICTORY');
            return SCORE.VICTORY;
        }
        if (score === Number.MIN_SAFE_INTEGER + 1) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'PRE_VICTORY_MIN');
            return SCORE.PRE_VICTORY;
        }
        if (score === Number.MAX_SAFE_INTEGER - 1) {
            display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'PRE_VICTORY_MAX');
            return SCORE.PRE_VICTORY;
        }
        display(MGPNode.VERBOSE || LOCAL_VERBOSE, 'DEFAULT');
        return SCORE.DEFAULT;
    }
                         // TODO: keep GameState, parent, and move
    public constructor(public readonly gameState: S,
                       public readonly mother: MGPOptional<MGPNode<R, M, S, L, B>> = MGPOptional.empty(),
                       public readonly move: MGPOptional<M> = MGPOptional.empty(),
                       public minimaxCreator?: Minimax<M, S, L, B>)
    {
        /* Initialization condition:
         * mother: null for initial board
         * board: should already be a clone
         */
        this.ownValue = new MGPMap<string, B>();
        if (minimaxCreator != null) {
            const firstValue: B = minimaxCreator.getBoardValue(this);
            this.ownValue.set(minimaxCreator.name, firstValue);
            this.hopedValue.set(minimaxCreator.name, firstValue.value);
        }
        MGPNodeStats.createdNodes++;
        display(MGPNode.VERBOSE, 'creating ' + this.myToString());
    }
                         // TODO: take AI as argument instead, probably refactor a bit -> no, that's pure AI
    public findBestMove(readingDepth: number,
                        minimax: Minimax<M, S, L, B>,
                        random: boolean = false,
                        prune: boolean = true,
                       useMCTS: boolean = false)
    : M
    {
        if (useMCTS) {
            const mcts = new MCTS(minimax, minimax.ruler);
            return mcts.search(this);
        }
        const startTime: number = new Date().getTime(); // TODO: move time computation to local game wrapper?
        let bestDescendant: MGPNode<R, M, S, L, B> = this.alphaBeta(readingDepth,
                                                                    Number.MIN_SAFE_INTEGER,
                                                                    Number.MAX_SAFE_INTEGER,
                                                                    minimax,
                                                                    random,
                                                                    prune);
        while (bestDescendant.gameState.turn > this.gameState.turn + 1) {
            bestDescendant = bestDescendant.mother.get();
            readingDepth--;
        }
        MGPNodeStats.minimaxTime += new Date().getTime() - startTime;
        return bestDescendant.move.get();
    }
                         // TODO: This is MinimaxAI's main method
    private getPossibleMoves(minimax: Minimax<M, S, L, B>): MGPSet<M> {
        const currentMoves: MGPOptional<MGPSet<M>> = this.possibleMoves.get(minimax.name);
        if (currentMoves.isAbsent()) {
            const moves: M[] = minimax.getListMoves(this);
            this.possibleMoves.set(minimax.name, new MGPSet(moves));
            return new MGPSet(moves);
        } else {
            return currentMoves.get();
        }
    }
                         // TODO: this seems to be MinimaxAI
    private getBestChilds(possibleMoves: MGPSet<M>,
                          depth: number,
                          alpha: number,
                          beta: number,
                          minimax: Minimax<M, S, L, B>,
                          random: boolean,
                          prune: boolean)
    : MGPNode<R, M, S, L, B>[]
    {

        let bestChilds: MGPNode<R, M, S, L, B>[] = [];
        const currentPlayer: Player = this.gameState.getCurrentPlayer();
        let extremumExpected: number =
            currentPlayer === Player.ZERO ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
        const newValueIsBetter: (newValue: number, currentValue: number) => boolean =
            currentPlayer === Player.ZERO ?
                ((a: number, b: number): boolean => a < b) :
                ((a: number, b: number): boolean => b < a);
        for (const move of possibleMoves) {
            const child: MGPNode<R, M, S, L, B> = this.getOrCreateChild(move, minimax);
            const bestChildDescendant: MGPNode<R, M, S, L, B> =
                child.alphaBeta(depth - 1, alpha, beta, minimax, random, prune);
            const bestChildValue: number = bestChildDescendant.getHopedValue(minimax);
            if (newValueIsBetter(bestChildValue, extremumExpected) || bestChilds.length === 0) {
                extremumExpected = bestChildValue;
                bestChilds = [bestChildDescendant];
            } else if (bestChildValue === extremumExpected) {
                bestChilds.push(bestChildDescendant);
            }
            if (prune && newValueIsBetter(extremumExpected, currentPlayer === Player.ZERO ? alpha : beta)) {
                // cut-off, no need to explore the other childs
                break;
            }
            if (currentPlayer === Player.ZERO) {
                beta = Math.min(extremumExpected, beta);
            } else {
                alpha = Math.max(extremumExpected, alpha);
            }
        }
        return bestChilds;
    }
    private getBestChildAmongst(bestChilds: MGPNode<R, M, S, L, B>[], random: boolean): MGPNode<R, M, S, L, B> {
        if (random) {
            const randomIndex: number = Math.floor(Math.random() * bestChilds.length);
            return bestChilds[randomIndex];
        } else {
            return bestChilds[0];
        }
    }
    public getSonByMove(move: M): MGPOptional<MGPNode<R, M, S, L, B>> {
        assert(this.childs.isPresent(), 'Cannot get son of uncalculated node');
        for (const node of this.childs.get()) {
            if (node.move.isPresent() && node.move.equalsValue(move)) {
                return MGPOptional.of(node);
            }
        }
        return MGPOptional.empty();
    }
    public getHopedValue(minimax: Minimax<M, S, L, B>): number {
        return this.hopedValue.get(minimax.name).get();
    }
    public getOwnValue(minimax: Minimax<M, S, L, B>): B {
        const ownValueOptional: MGPOptional<B> = this.ownValue.get(minimax.name);
        if (ownValueOptional.isAbsent()) {
            const ownValue: B = minimax.getBoardValue(this);
            this.ownValue.set(minimax.name, ownValue);
            return ownValue;
        } else {
            return ownValueOptional.get();
        }
    }
    public myToString(): string {
        let genealogy: string = '';
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let node: MGPNode<R, M, S, L, B> = this;
        if (node.mother.isAbsent()) {
            const turn: number = node.gameState.turn;
            return 'NodeInitial: ' + turn;
        }
        while (node.mother.isPresent()) {
            const move: string = node.move.isAbsent() ? ' ' : ' > ' + node.move.get().toString() + '> ';
            const turn: number = node.gameState.turn;
            genealogy = move + turn + ' ' + genealogy;
            node = node.mother.get();
        }
        return 'Node: ' + genealogy;
    }
                         // TODO: rename hasComputedMoves? hasComputedChildren?
    public hasMoves(): boolean {
        return this.childs.isPresent();
    }
    // debug
    public countDescendants(): number {
        if (this.childs.isAbsent()) {
            return 0;
        }
        let nbDescendants: number = this.childs.get().length;
        for (const son of this.childs.get()) {
            nbDescendants += son.countDescendants();
        }
        return nbDescendants;
    }
}

export abstract class AbstractNode extends MGPNode<Rules<Move, GameState, unknown>, Move, GameState, unknown> {
}
