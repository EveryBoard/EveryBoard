import { ArrayUtils, MGPFallible, MGPOptional, Set, Utils } from '@everyboard/lib';

import { GameStatus } from '../GameStatus';
import { Move } from '../Move';
import { Player } from '../Player';
import { PlayerNumberTable } from '../PlayerNumberTable';
import { SuperRules } from '../Rules';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { GameState } from '../state/GameState';

import { AI, AIDepthLimitOptions, AIOptions, AIStats, AITimeLimitOptions, MoveGenerator } from './AI';
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

export class DummyHeuristic<M extends Move, S extends GameState, C extends RulesConfig = EmptyRulesConfig>
    extends PlayerMetricHeuristic<M, S, C>
{

    public override getMetrics(_node: GameNode<M, S>, _config?: C): PlayerNumberTable {
        // This is really a dummy heuristic: boards have no value
        return PlayerNumberTable.ofSingle(0, 0);
    }

}


// Bound used by transposition tables
type TTBound = 'EXACT' | 'LOWER' | 'UPPER';
// A transposition table entry
interface TTEntry<M> {
    depth: number;
    score: BoardValue;
    bound: TTBound;
    bestMove: M;
}

/**
 * This implements the minimax algorithm with alpha-beta pruning.
 */
export abstract class AbstractMinimax<M extends Move,
                                      S extends GameState,
                                      O extends AIOptions,
                                      C extends RulesConfig = EmptyRulesConfig,
                                      L = void>
implements AI<M, S, O, C>
{

    // States whether the minimax takes random moves from the list of best moves.
    protected random: boolean = false;
    // States whether alpha-beta pruning must be done. It probably is never useful to set it to false.
    protected prune: boolean = true;
    // States whether transposition tables should be used.
    // It's rare you don't want this, as you get 1-2 level extra in the same duration.
    protected transpositionTables: boolean = true;

    // The options of this minimax. Usually filled in by the constructor.
    public availableOptions: O[] = [];

    // Can be set dynamically to stop the search early and return the current best results
    protected endSearchBy: MGPOptional<number> = MGPOptional.empty();

    private readonly transpositionTable: Map<string, TTEntry<M>> = new Map<string, TTEntry<M>>();

    public constructor(public readonly name: string,
                       protected readonly rules: SuperRules<M, S, C, L>,
                       protected readonly heuristic: Heuristic<M, S, BoardValue, C>,
                       protected readonly moveGenerator: MoveGenerator<M, S, C>)
    {
    }
    public toString(): string {
        return this.name;
    }

    // Hash used for transposition tables
    protected hash(state: S): string {
        // This dumb hash works surprisingly well, but it can be useful to redefine it
        // in particular to take benefit of symmetries etc. (but it has to be fast)
        // Typical stuff we want to do:
        // - remove any score information
        // Watch out not to do this:
        // - remove turn information if the same board can be achieved
        //   irrespective of the turn, otherwise this will confuse the minimax
        //   (because the best move at board 0 depends on the player)
        return JSON.stringify(state);
    }


    public abstract doChooseNextMove(node: GameNode<M, S>, options: O, config: C): M;

    public chooseNextMove(node: GameNode<M, S>, options: O, config: C): M {
        const start: number = performance.now();

        try {
            return this.doChooseNextMove(node, options, config);
        } finally {
            const duration: number = performance.now() - start;

            const key: string = this.toString();
            const previous: number = AIStats.aiTime.get(key) ?? 0;
            AIStats.aiTime.set(key, previous + duration);
        }
    }

    // Performs an alpha-beta search to find the best move from the given node
    // @return empty when there is no best move (because the game or search has finished)
    protected alphaBeta(node: GameNode<M, S>,
                        depth: number,
                        alpha: BoardValue,
                        beta: BoardValue,
                        config: C)
    : MGPOptional<{ move: M, score: BoardValue }>
    {
        if (depth < 1) {
            return MGPOptional.empty(); // this is the end of our search as we attained the required depth
        } else if (this.rules.getGameStatus(node, config).isEndGame) {
            return MGPOptional.empty(); // this is a leaf as the game has ended
        }

        let ttKey: string = '';
        let ttEntry: TTEntry<M> | undefined = undefined;
        const alphaOrig: BoardValue = alpha;
        const betaOrig: BoardValue = beta;
        if (this.transpositionTables) {
            // Use the transposition table to either already find the best move without searching,
            // or to restrict alpha/beta further if possible
            ttKey = this.hash(node.gameState);
            ttEntry = this.transpositionTable.get(ttKey);
            if (ttEntry && ttEntry.depth >= depth) {
                switch (ttEntry.bound) {
                    case 'EXACT':
                        this.setScore(node, ttEntry.score);
                        return MGPOptional.of({ move: ttEntry.bestMove, score: ttEntry.score });
                    case 'LOWER':
                        alpha = BoardValue.max(alpha, ttEntry.score);
                        break;
                    case 'UPPER':
                        beta = BoardValue.min(beta, ttEntry.score);
                        break;
                }
                if (BoardValue.isGreaterThan(alpha, beta) || alpha.equals(beta)) {
                    this.setScore(node, ttEntry.score);
                    return MGPOptional.of({ move: ttEntry.bestMove, score: ttEntry.score });
                }
            }
        }

        let possibleMoves: Set<M> = this.getPossibleMoves(node, config);
        Utils.assert(possibleMoves.size() > 0, 'Minimax ' + this.name + ' should give move, received none!');

        if (this.transpositionTables && ttEntry?.bestMove) {
            // reorder possible moves for more pruning: best move goes first
            Utils.assert(possibleMoves.contains(ttEntry.bestMove),
                         'TT bestMove ' + ttEntry.bestMove.toString() + ' is not in possible moves for state ' + this.hash(node.gameState));
            possibleMoves.removeElement(ttEntry.bestMove);
            possibleMoves = new Set([ttEntry.bestMove, ...possibleMoves]);
        }

        const bestMoves: { move: M, score: BoardValue }[] =
            this.getBestMoves(node, possibleMoves, depth, alpha, beta, config);
        const bestMove: { move: M, score: BoardValue } = this.getBestMoveAmong(bestMoves);
        Utils.assert(possibleMoves.contains(bestMove.move), 'best child is not a possible move?!' + bestMove.move.toString());
        this.setScore(node, bestMove.score);

        if (this.transpositionTables) {
            // Update the transposition table
            let bound: TTBound;
            if (BoardValue.isLessThan(bestMove.score, alphaOrig)) {
                bound = 'UPPER';
            } else if (BoardValue.isGreaterThan(bestMove.score, betaOrig)) {
                bound = 'LOWER';
            } else {
                bound = 'EXACT';
            }

            this.transpositionTable.set(ttKey, {
                depth,
                score: bestMove.score,
                bound,
                bestMove: bestMove.move,
            });
        }
        return MGPOptional.of(bestMove);
    }

    private getPossibleMoves(node: GameNode<M, S>, config: C): Set<M> {
        const currentMoves: MGPOptional<Set<M>> = this.getMoves(node);
        if (currentMoves.isAbsent()) {
            const moves: M[] = this.moveGenerator.getListMoves(node, config);
            this.setMoves(node, new Set(moves));
            return new Set(moves);
        } else {
            return currentMoves.get();
        }
    }

    private getBestMoves(node: GameNode<M, S>,
                         possibleMoves: Set<M>,
                         depth: number,
                         alpha: BoardValue,
                         beta: BoardValue,
                         config: C)
    : { move: M, score: BoardValue }[]
    {
        let bestMoves: { move: M, score: BoardValue }[] = [];
        const currentPlayer: Player = node.gameState.getCurrentPlayer();
        let extremumExpected: BoardValue = this.getExpectedExtremum(node, config);
        const newValueIsBetter: (newValue: BoardValue, currentValue: BoardValue) => boolean =
            currentPlayer === Player.ZERO ? BoardValue.isLessThan : BoardValue.isGreaterThan;

        for (const move of possibleMoves) {
            if (this.endSearchBy.isPresent() && Date.now() > this.endSearchBy.get() && bestMoves.length > 0) {
                return bestMoves;
            }
            const child: GameNode<M, S> = this.getOrCreateChild(node, move, config);
            const bestMoveOptional: MGPOptional<{ move: M, score: BoardValue }> =
                this.alphaBeta(child, depth - 1, alpha, beta, config);
            let bestMove: { move: M, score: BoardValue };
            if (bestMoveOptional.isAbsent()) {
                // depth or end of game achieved
                bestMove = { move: move, score: this.getScore(child, config) };
            } else {
                bestMove = bestMoveOptional.get();
                bestMove.move = move;
            }
            if (newValueIsBetter(bestMove.score, extremumExpected) || bestMoves.length === 0) {
                extremumExpected = bestMove.score;
                bestMoves = [bestMove];
            } else if (bestMove.score.equals(extremumExpected)) {
                bestMoves.push(bestMove);
            }
            if (this.prune && newValueIsBetter(extremumExpected, currentPlayer === Player.ZERO ? alpha : beta)) {
                // cut-off, no need to explore the other children
                break;
            }
            if (currentPlayer === Player.ZERO) {
                beta = BoardValue.min(extremumExpected, beta);
            } else {
                alpha = BoardValue.max(extremumExpected, alpha);
            }
        }
        return bestMoves;
    }

    protected getExpectedExtremum(node: GameNode<M, S>, config: C): BoardValue {
        const childValue: BoardValue = this.getScore(node, config);
        const currentPlayer: Player = node.gameState.getCurrentPlayer();
        if (currentPlayer === Player.ZERO) {
            return childValue.toMaximum();
        } else {
            return childValue.toMinimum();
        }
    }

    private getBestMoveAmong(moves: { move: M, score: BoardValue }[]): { move: M, score: BoardValue } {
        Utils.assert(moves.length > 0, 'getBestChildAmong expects at least one child');
        if (this.random) {
            return ArrayUtils.getRandomElement(moves);
        } else {
            return moves[0];
        }
    }

    private getOrCreateChild(node: GameNode<M, S>, move: M, config: C): GameNode<M, S> {
        const child: MGPOptional<GameNode<M, S>> = node.getChild(move);
        if (child.isAbsent()) {
            const legality: MGPFallible<L> = this.rules.isLegal(move, node.gameState, config);
            const moveString: string = move.toString();
            Utils.assert(legality.isSuccess(), 'The minimax "' + this.name + '" has proposed an illegal move at turn ' + node.gameState.turn + ' (' + moveString + '), ' +
                                               'refusal reason: "' + legality.getReasonOr('') + '", this should not happen.');
            const state: S = this.rules.applyLegalMove(move, node.gameState, config, legality.get());
            const newChild: GameNode<M, S> = new GameNode(state,
                                                          MGPOptional.of(node),
                                                          MGPOptional.of(move));
            node.addChild(newChild);
            this.setScore(newChild, this.computeBoardValue(newChild, config));
            return newChild;
        }
        return child.get();
    }

    private setScore(node: GameNode<M, S>, score: BoardValue): void {
        node.setCache(this.name + '-score', score);
    }

    private getScore(node: GameNode<M, S>, config: C): BoardValue {
        // Scores are created during node creation, so we might think that they are always present
        // but other AIs can expand the tree without creating the scores
        const score: MGPOptional<BoardValue> = node.getCache<BoardValue>(this.name + '-score');
        if (score.isPresent()) {
            return score.get();
        } else {
            const boardValue: BoardValue = this.computeBoardValue(node, config);
            this.setScore(node, boardValue);
            return boardValue;
        }
    }

    private computeBoardValue(node: GameNode<M, S>, config: C): BoardValue {
        const gameStatus: GameStatus = this.rules.getGameStatus(node, config);
        if (gameStatus.isEndGame) {
            return gameStatus.toBoardValue();
        } else {
            return this.heuristic.getBoardValue(node, config);
        }
    }

    private setMoves(node: GameNode<M, S>, moves: Set<M>): void {
        node.setCache(this.name + '-moves', moves);
    }

    private getMoves(node: GameNode<M, S>): MGPOptional<Set<M>> {
        return node.getCache(this.name + '-moves');
    }

    public getInfo(node: GameNode<M, S>, config: C): string {
        return 'BoardValue=' + this.heuristic.getBoardValue(node, config).metrics;
    }

}

export class Minimax<M extends Move,
                     S extends GameState,
                     C extends RulesConfig = EmptyRulesConfig,
                     L = void>
    extends AbstractMinimax<M, S, AIDepthLimitOptions, C, L> {

    public constructor(name: string,
                       rules: SuperRules<M, S, C, L>,
                       heuristic: Heuristic<M, S, BoardValue, C>,
                       moveGenerator: MoveGenerator<M, S, C>) {
        super(name, rules, heuristic, moveGenerator);
        for (let i: number = 1; i < 10; i++) {
            this.availableOptions.push({ name: `Level ${i}`, maxDepth: i });
        }
    }

    public doChooseNextMove(node: GameNode<M, S>, options: AIDepthLimitOptions, config: C): M {
        Utils.assert(this.rules.getGameStatus(node, config).isEndGame === false,
                     'Minimax has been asked to choose a move from a finished game');
        const boardValue: BoardValue = this.getExpectedExtremum(node, config);
        return this.alphaBeta(node,
                              options.maxDepth,
                              boardValue.toMinimum(),
                              boardValue.toMaximum(),
                              config).get().move;
    }
}

export class IterativeDeepeningMinimax<M extends Move,
                                       S extends GameState,
                                       C extends RulesConfig = EmptyRulesConfig,
                                       L = void>
    extends AbstractMinimax<M, S, AITimeLimitOptions, C, L> {

    public constructor(name: string,
                       rules: SuperRules<M, S, C, L>,
                       heuristic: Heuristic<M, S, BoardValue, C>,
                       moveGenerator: MoveGenerator<M, S, C>) {
        super(name, rules, heuristic, moveGenerator);
        for (let i: number = 1; i < 10; i++) {
            this.availableOptions.push({ name: `${i*i} seconds`, maxSeconds: i*i });
        }
    }

    public doChooseNextMove(node: GameNode<M, S>, options: AITimeLimitOptions, config: C): M {
        Utils.assert(this.rules.getGameStatus(node, config).isEndGame === false,
                     'Minimax has been asked to choose a move from a finished game');
        const boardValue: BoardValue = this.getExpectedExtremum(node, config);

        const start: number = Date.now();
        const endTime: number = Date.now() + options.maxSeconds * 1000;
        this.endSearchBy = MGPOptional.of(endTime);
        let currentDepth: number = 1;
        let achievedDepth: number = 1; // only for logging
        let bestMove: MGPOptional<M> = MGPOptional.empty();
        while (Date.now() < endTime) {
            const candidateOptional: MGPOptional<{ move: M, score: BoardValue }> =
                this.alphaBeta(node, currentDepth, boardValue.toMinimum(), boardValue.toMaximum(), config);
            if (candidateOptional.isAbsent()) {
                // Search finished, no need to explore further
                break;
            }
            const candidate: { move: M, score: BoardValue } = candidateOptional.get();
            if (Date.now() < this.endSearchBy.get()) {
                bestMove = MGPOptional.of(candidate.move);
                achievedDepth = currentDepth;
            }
            currentDepth++;
        }
        Utils.assert(bestMove.isPresent(), 'best move should have been computed');
        console.log('achieved depth: ' + achievedDepth + ' in ' + (Date.now() - start) + 'ms')

        this.endSearchBy = MGPOptional.empty();
        return bestMove.get();
    }
}
