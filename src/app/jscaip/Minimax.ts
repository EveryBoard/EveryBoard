import { AI, AIDepthLimitOptions, GameNode, MoveGenerator } from './MGPNode';
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

/**
 * A heuristic assigns a specific value for a node.
 * This is used for example by minimax-based AIs.
 * The value assigned to a node can be more than just a number, and is thus a `BoardValue`
 */
export abstract class Heuristic<M extends Move, S extends GameState, B extends BoardValue = BoardValue> {
    public abstract getBoardValue(node: GameNode<M, S>): B;
}

export abstract class PlayerMetricHeuristic<M extends Move, S extends GameState>
  extends Heuristic<M, S>
{
    public abstract getMetrics(node: GameNode<M, S>): [number, number];
    public getBoardValue(node: GameNode<M, S>): BoardValue {
        const metrics: [number, number] = this.getMetrics(node);
        return BoardValue.of(metrics[0], metrics[1]);
    }
}

export class DummyHeuristic<M extends Move, S extends GameState> extends PlayerMetricHeuristic<M, S> {
    public getMetrics(node: GameNode<M, S>): [number, number] {
        // This is really a dummy heuristic: boards have no value
        return [0, 0];
    }
}

/**
 * This implements the minimax algorithm with alpha-beta pruning.
 */
export class Minimax<M extends Move, S extends GameState, L = void>
    implements AI<M, S, AIDepthLimitOptions>
{
    // States whether the minimax takes random moves from the list of best moves.
    public RANDOM: boolean = false;
    // States whether alpha-beta pruning must be done. It probably is never useful to set it to false.
    public PRUNE: boolean = true;

    public readonly availableOptions: AIDepthLimitOptions[] = [];

    public constructor(public readonly name: string,
                       private readonly rules: Rules<M, S, L>,
                       private readonly heuristic: Heuristic<M, S>,
                       private readonly moveGenerator: MoveGenerator<M, S>) {
        for (let i: number = 1; i < 10; i++) {
            this.availableOptions.push({ name: `Level ${i}`, maxDepth: i });
        }
    }
    public toString(): string {
        return this.name;
    }
    public chooseNextMove(node: GameNode<M, S>, options: AIDepthLimitOptions): M {
        Utils.assert(this.rules.getGameStatus(node).isEndGame === false, 'Minimax has been asked to choose a move from a finished game');
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
        const bestChildScore: BoardValue = this.getScore(bestChild);
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
            Utils.assert(legality.isSuccess(), 'The minimax "' + this.name + '" has proposed an illegal move (' + moveString + '), refusal reason: ' + legality.getReasonOr('') + ' this should not happen.');
            const state: S = this.rules.applyLegalMove(move, node.gameState, legality.get());
            const newChild = new GameNode(state, MGPOptional.of(node), MGPOptional.of(move));
            node.addChild(move, newChild)
            this.setScore(newChild, this.computeBoardValue(newChild));
            return newChild;
        }
        return child.get();
    }
    private setScore(node: GameNode<M, S>, score: BoardValue): void {
        node.setCache(this.name + '-score', score);
    }
    private getScore(node: GameNode<M, S>): BoardValue {
        // Scores are created during node creation, so we might think that they are always present
        // but other AIs can expand the tree without creating the scores
        const score: MGPOptional<BoardValue> = node.getCache<BoardValue>(this.name + '-score');
        if (score.isPresent()) {
            return score.get();
        } else {
            const boardValue: BoardValue = this.computeBoardValue(node);
            this.setScore(node, boardValue);
            return boardValue;
        }
    }
    private computeBoardValue(node: GameNode<M, S>): BoardValue {
        const gameStatus: GameStatus = this.rules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return gameStatus.toBoardValue();
        } else {
            return this.heuristic.getBoardValue(node);
        }
    }
    private setMoves(node: GameNode<M, S>, moves: MGPSet<M>): void {
        node.setCache(this.name + '-moves', moves);
    }
    private getMoves(node: GameNode<M, S>): MGPOptional<MGPSet<M>> {
        return node.getCache(this.name + '-moves');
    }
}
