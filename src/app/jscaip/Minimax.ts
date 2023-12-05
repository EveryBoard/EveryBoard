import { AI, AIDepthLimitOptions, MoveGenerator } from './AI';
import { Move } from './Move';
import { BoardValue } from './BoardValue';
import { Rules } from './Rules';
import { GameState } from './GameState';
import { MGPSet } from '../utils/MGPSet';
import { MGPOptional } from '../utils/MGPOptional';
import { Player } from './Player';
import { MGPFallible } from '../utils/MGPFallible';
import { Utils } from '../utils/utils';
import { ArrayUtils } from '../utils/ArrayUtils';
import { GameStatus } from './GameStatus';
import { EmptyRulesConfig, RulesConfig } from './RulesConfigUtil';
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
    public abstract getBoardValue(node: GameNode<M, S, C>, config: MGPOptional<C>): B;
}

export abstract class PlayerMetricHeuristic<M extends Move,
                                            S extends GameState,
                                            C extends RulesConfig = EmptyRulesConfig>
    extends Heuristic<M, S, BoardValue, C>
{
    public abstract getMetrics(node: GameNode<M, S, C>, config: MGPOptional<C>): [number, number];

    public getBoardValue(node: GameNode<M, S, C>, config: MGPOptional<C>): BoardValue {
        const metrics: [number, number] = this.getMetrics(node, config);
        return BoardValue.of(metrics[0], metrics[1]);
    }

}

export class DummyHeuristic<M extends Move, S extends GameState, C extends RulesConfig = EmptyRulesConfig>
    extends PlayerMetricHeuristic<M, S, C>
{

    public getMetrics(_node: GameNode<M, S, C>, _config?: MGPOptional<C>): [number, number] {
        // This is really a dummy heuristic: boards have no value
        return [0, 0];
    }

}

/**
 * This implements the minimax algorithm with alpha-beta pruning.
 */
export class Minimax<M extends Move,
                     S extends GameState,
                     C extends RulesConfig = EmptyRulesConfig,
                     L = void>
implements AI<M, S, AIDepthLimitOptions, C>
{

    // States whether the minimax takes random moves from the list of best moves.
    public random: boolean = false;
    // States whether alpha-beta pruning must be done. It probably is never useful to set it to false.
    public prune: boolean = true;

    public readonly availableOptions: AIDepthLimitOptions[] = [];

    public constructor(public readonly name: string,
                       private readonly rules: Rules<M, S, C, L>,
                       private readonly heuristic: Heuristic<M, S, BoardValue, C>,
                       private readonly moveGenerator: MoveGenerator<M, S, C>)
    {
        for (let i: number = 1; i < 10; i++) {
            this.availableOptions.push({ name: `Level ${i}`, maxDepth: i });
        }
    }

    public toString(): string {
        return this.name;
    }

    public chooseNextMove(node: GameNode<M, S, C>, options: AIDepthLimitOptions, config: MGPOptional<C>): M {
        Utils.assert(this.rules.getGameStatus(node, config).isEndGame === false,
                     'Minimax has been asked to choose a move from a finished game');
        let bestDescendant: GameNode<M, S, C> = this.alphaBeta(node,
                                                               options.maxDepth,
                                                               Number.MIN_SAFE_INTEGER,
                                                               Number.MAX_SAFE_INTEGER,
                                                               config);
        while (bestDescendant.gameState.turn > node.gameState.turn + 1) {
            bestDescendant = bestDescendant.parent.get();
        }
        return bestDescendant.previousMove.get();
    }

    public alphaBeta(node: GameNode<M, S, C>, depth: number, alpha: number, beta: number, config: MGPOptional<C>)
    : GameNode<M, S, C>
    {
        if (depth < 1) {
            return node; // leaf by calculation
        } else if (this.rules.getGameStatus(node, config).isEndGame) {
            return node; // rules - leaf or calculation - leaf
        }
        const possibleMoves: MGPSet<M> = this.getPossibleMoves(node, config);
        Utils.assert(possibleMoves.size() > 0, 'Minimax ' + this.name + ' should give move, received none!');
        const bestChildren: GameNode<M, S, C>[] = this.getBestChildren(node, possibleMoves, depth, alpha, beta, config);
        const bestChild: GameNode<M, S, C> = this.getBestChildAmong(bestChildren);
        const bestChildScore: BoardValue = this.getScore(bestChild, config);
        this.setScore(node, bestChildScore);
        return bestChild;
    }

    private getPossibleMoves(node: GameNode<M, S, C>, config: MGPOptional<C>): MGPSet<M> {
        const currentMoves: MGPOptional<MGPSet<M>> = this.getMoves(node);
        if (currentMoves.isAbsent()) {
            const moves: M[] = this.moveGenerator.getListMoves(node, config);
            this.setMoves(node, new MGPSet(moves));
            return new MGPSet(moves);
        } else {
            return currentMoves.get();
        }
    }

    private getBestChildren(node: GameNode<M, S, C>,
                            possibleMoves: MGPSet<M>,
                            depth: number,
                            alpha: number,
                            beta: number,
                            config: MGPOptional<C>)
    : GameNode<M, S, C>[]
    {
        let bestChildren: GameNode<M, S, C>[] = [];
        const currentPlayer: Player = node.gameState.getCurrentPlayer();
        let extremumExpected: number =
            currentPlayer === Player.ZERO ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
        const newValueIsBetter: (newValue: number, currentValue: number) => boolean =
            currentPlayer === Player.ZERO ?
                ((a: number, b: number): boolean => a < b) :
                ((a: number, b: number): boolean => b < a);
        for (const move of possibleMoves) {
            const child: GameNode<M, S, C> = this.getOrCreateChild(node, move, config);
            const bestChildDescendant: GameNode<M, S, C> = this.alphaBeta(child, depth - 1, alpha, beta, config);
            const bestChildValue: number = this.getScore(bestChildDescendant, config).value;
            if (newValueIsBetter(bestChildValue, extremumExpected) || bestChildren.length === 0) {
                extremumExpected = bestChildValue;
                bestChildren = [bestChildDescendant];
            } else if (bestChildValue === extremumExpected) {
                bestChildren.push(bestChildDescendant);
            }
            if (this.prune && newValueIsBetter(extremumExpected, currentPlayer === Player.ZERO ? alpha : beta)) {
                // cut-off, no need to explore the other children
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

    private getBestChildAmong(bestChildren: GameNode<M, S, C>[]): GameNode<M, S, C> {
        if (this.random) {
            return ArrayUtils.getRandomElement(bestChildren);
        } else {
            return bestChildren[0];
        }
    }

    private getOrCreateChild(node: GameNode<M, S, C>, move: M, config: MGPOptional<C>): GameNode<M, S, C> {
        const child: MGPOptional<GameNode<M, S, C>> = node.getChild(move);
        if (child.isAbsent()) {
            const legality: MGPFallible<L> = this.rules.getLegality(move, node.gameState, config);
            const moveString: string = move.toString();
            Utils.assert(legality.isSuccess(), 'The minimax "' + this.name + '" has proposed an illegal move (' + moveString + '), refusal reason: ' + legality.getReasonOr('') + ' this should not happen.');
            const state: S = this.rules.applyLegalMove(move, node.gameState, config, legality.get());
            const newChild: GameNode<M, S, C> = new GameNode(state,
                                                             MGPOptional.of(node),
                                                             MGPOptional.of(move));
            node.addChild(newChild);
            this.setScore(newChild, this.computeBoardValue(newChild, config));
            return newChild;
        }
        return child.get();
    }

    private setScore(node: GameNode<M, S, C>, score: BoardValue): void {
        node.setCache(this.name + '-score', score);
    }

    private getScore(node: GameNode<M, S, C>, config: MGPOptional<C>): BoardValue {
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

    private computeBoardValue(node: GameNode<M, S, C>, config: MGPOptional<C>): BoardValue {
        const gameStatus: GameStatus = this.rules.getGameStatus(node, config);
        if (gameStatus.isEndGame) {
            return gameStatus.toBoardValue();
        } else {
            return this.heuristic.getBoardValue(node, config);
        }
    }

    private setMoves(node: GameNode<M, S, C>, moves: MGPSet<M>): void {
        node.setCache(this.name + '-moves', moves);
    }

    private getMoves(node: GameNode<M, S, C>): MGPOptional<MGPSet<M>> {
        return node.getCache(this.name + '-moves');
    }

    public getInfo(node: GameNode<M, S, C>, config: MGPOptional<C>): string {
        return 'BoardValue=' + this.heuristic.getBoardValue(node, config).value;
    }

}
