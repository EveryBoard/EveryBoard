import { ArrayUtils, MGPFallible, MGPOptional, Set, Utils } from '@everyboard/lib';

import { GameStatus } from '../GameStatus';
import { Move } from '../Move';
import { Player } from '../Player';
import { SuperRules } from '../Rules';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { GameState } from '../state/GameState';

import { AI, AIOptions, AIStats, MoveGenerator } from './AI';
import type { MinimaxConfig } from './AIConfig';
import { BoardValue } from './BoardValue';
import { GameNode } from './GameNode';
import { Heuristic } from './Heuristic';

export type MinimaxHashFunction<S extends GameState> = (state: S) => string;

// Bound used by transposition tables
type TTBound = 'EXACT' | 'LOWER' | 'UPPER';
// A transposition table entry
interface TTEntry<M> {
    depth: number;
    score: BoardValue;
    bound: TTBound;
    bestMove: M;
}

export type SearchResult<M> = {
    move: M;
    score: BoardValue;
    complete: boolean;
};

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
    protected useRandomness: boolean = false;
    // States whether alpha-beta pruning must be done. It probably is never useful to set it to false.
    protected prune: boolean = true;
    // States whether transposition tables should be used.
    // It's rare you don't want this, as you get 1-2 level extra in the same duration.
    protected useTranspositionTables: boolean = true;

    // The options of this minimax. Usually filled in by the constructor.
    public availableOptions: O[] = [];

    // Can be set dynamically to stop the search early and return the current best results
    protected endSearchBy: MGPOptional<number> = MGPOptional.empty();

    private readonly transpositionTable: Map<string, TTEntry<M>> = new Map<string, TTEntry<M>>();

    public constructor(public readonly name: string,
                       protected readonly rules: SuperRules<M, S, C, L>,
                       protected readonly heuristic: Heuristic<M, S, BoardValue, C>,
                       protected readonly moveGenerator: MoveGenerator<M, S, C>,
                       private readonly hashOverride?: MinimaxHashFunction<S>)
    {
    }
    public toString(): string {
        return this.name;
    }

    // Hash used for transposition tables
    protected hash(state: S): string {
        if (this.hashOverride != null) {
            return this.hashOverride(state);
        }
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

    public configureFromConfig(config: Pick<MinimaxConfig<M, S, C>,
                                            'useRandomness' | 'prune' | 'useTranspositionTables'>)
    : void
    {
        this.useRandomness = config.useRandomness ?? this.useRandomness;
        this.prune = config.prune ?? this.prune;
        this.useTranspositionTables = config.useTranspositionTables ?? this.useTranspositionTables;
    }

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
    : MGPOptional<SearchResult<M>>
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
        if (this.useTranspositionTables) {
            // Use the transposition table to either already find the best move without searching,
            // or to restrict alpha/beta further if possible
            ttKey = this.hash(node.gameState);
            ttEntry = this.transpositionTable.get(ttKey);
            if (ttEntry && ttEntry.depth >= depth) {
                switch (ttEntry.bound) {
                    case 'EXACT':
                        this.setScore(node, ttEntry.score);
                        return MGPOptional.of({ move: ttEntry.bestMove, score: ttEntry.score, complete: true });
                    case 'LOWER':
                        alpha = BoardValue.max(alpha, ttEntry.score);
                        break;
                    case 'UPPER':
                        beta = BoardValue.min(beta, ttEntry.score);
                        break;
                }
                if (BoardValue.isGreaterThan(alpha, beta) || alpha.equals(beta)) {
                    this.setScore(node, ttEntry.score);
                    return MGPOptional.of({ move: ttEntry.bestMove, score: ttEntry.score, complete: true });
                }
            }
        }

        let possibleMoves: Set<M> = this.getPossibleMoves(node, config);
        Utils.assert(possibleMoves.size() > 0, 'Minimax ' + this.name + ' should give move, received none!');

        if (this.useTranspositionTables && ttEntry?.bestMove) {
            // reorder possible moves for more pruning: best move goes first
            Utils.assert(possibleMoves.contains(ttEntry.bestMove),
                         'TT bestMove ' + ttEntry.bestMove.toString() + ' is not in possible moves for state ' + this.hash(node.gameState));
            possibleMoves.removeElement(ttEntry.bestMove);
            possibleMoves = new Set([ttEntry.bestMove, ...possibleMoves]);
        }

        const search: { bestMoves: SearchResult<M>[]; complete: boolean } =
            this.getBestMoves(node, possibleMoves, depth, alpha, beta, config);
        const bestMove: SearchResult<M> = this.getBestMoveAmong(search.bestMoves);
        Utils.assert(possibleMoves.contains(bestMove.move), 'best child is not a possible move?!' + bestMove.move.toString());
        this.setScore(node, bestMove.score);

        if (this.useTranspositionTables && search.complete) {
            // Update the transposition table
            let bound: TTBound;
            if (BoardValue.isLessThan(bestMove.score, alphaOrig) || bestMove.score.equals(alphaOrig)) {
                bound = 'UPPER';
            } else if (BoardValue.isGreaterThan(bestMove.score, betaOrig) || bestMove.score.equals(betaOrig)) {
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
        return MGPOptional.of({
            move: bestMove.move,
            score: bestMove.score,
            complete: search.complete,
        });
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
    : { bestMoves: SearchResult<M>[]; complete: boolean }
    {
        let bestMoves: SearchResult<M>[] = [];
        let complete: boolean = true;
        const currentPlayer: Player = node.gameState.getCurrentPlayer();
        let extremumExpected: BoardValue = this.getExpectedExtremum(node, config);
        const newValueIsBetter: (newValue: BoardValue, currentValue: BoardValue) => boolean =
            currentPlayer === Player.ZERO ? BoardValue.isLessThan : BoardValue.isGreaterThan;

        for (const move of possibleMoves) {
            if (this.endSearchBy.isPresent() && Date.now() > this.endSearchBy.get() && bestMoves.length > 0) {
                return { bestMoves, complete: false };
            }
            const child: GameNode<M, S> = this.getOrCreateChild(node, move, config);
            const bestMoveOptional: MGPOptional<SearchResult<M>> =
                this.alphaBeta(child, depth - 1, alpha, beta, config);
            let bestMove: SearchResult<M>;
            if (bestMoveOptional.isAbsent()) {
                // depth or end of game achieved
                bestMove = { move: move, score: this.getScore(child, config), complete: true };
            } else {
                bestMove = bestMoveOptional.get();
                bestMove = {
                    move,
                    score: bestMove.score,
                    complete: bestMove.complete,
                };
                complete = complete && bestMove.complete;
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
        return { bestMoves, complete };
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

    private getBestMoveAmong(moves: SearchResult<M>[]): SearchResult<M> {
        Utils.assert(moves.length > 0, 'getBestChildAmong expects at least one child');
        if (this.useRandomness) {
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
