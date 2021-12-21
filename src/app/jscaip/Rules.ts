import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Move } from './Move';
import { Type } from '@angular/core';
import { assert, display } from '../utils/utils';
import { Player } from './Player';
import { GameState } from './GameState';
import { MGPOptional } from '../utils/MGPOptional';
import { MGPFallible } from '../utils/MGPFallible';
import { NodeUnheritance } from './NodeUnheritance';

export class GameStatus {

    public static readonly ZERO_WON: GameStatus = new GameStatus(true, Player.ZERO);

    public static readonly ONE_WON: GameStatus = new GameStatus(true, Player.ONE);

    public static readonly DRAW: GameStatus = new GameStatus(true, Player.NONE);

    public static readonly ONGOING: GameStatus = new GameStatus(false, Player.NONE);

    public static getVictory(nonNonePlayer: Player): GameStatus {
        assert(nonNonePlayer !== Player.NONE, 'getVictory called with Player.NONE');
        if (nonNonePlayer === Player.ZERO) {
            return GameStatus.ZERO_WON;
        } else {
            return GameStatus.ONE_WON;
        }
    }
    public static getDefeat(nonNonePlayer: Player): GameStatus {
        assert(nonNonePlayer !== Player.NONE, 'getVictory called with Player.NONE');
        if (nonNonePlayer === Player.ZERO) {
            return GameStatus.ONE_WON;
        } else {
            return GameStatus.ZERO_WON;
        }
    }
    private constructor(public readonly isEndGame: boolean, public readonly winner: Player) {
    }
    public toBoardValue(): number {
        if (this.winner !== Player.NONE) {
            return this.winner.getVictoryValue();
        } else {
            return 0;
        }
    }
}

export abstract class Rules<M extends Move,
                            S extends GameState,
                            L = void,
                            U extends NodeUnheritance = NodeUnheritance>
{

    public constructor(public readonly stateType: Type<S>) {
        this.setInitialBoard();
    }
    public node: MGPNode<Rules<M, S, L, U>, M, S, L, U>;
    /* The data that represent the status of the game at the current moment, including:
     * the board
     * the turn
     * the extra data that might be score of each player
     * the remaining pawn that you can put on the board...
     */

    public choose(move: M): boolean {
        /* used by the rules to update board
         * return true if the move was legal, and the node updated
         * return false otherwise
         */
        const LOCAL_VERBOSE: boolean = false;
        display(LOCAL_VERBOSE, 'Rules.choose: ' + move.toString() + ' was proposed');
        const legality: MGPFallible<L> = this.isLegal(move, this.node.gameState);
        if (this.node.hasMoves()) { // if calculation has already been done by the AI
            display(LOCAL_VERBOSE, 'Rules.choose: current node has moves');
            const choice: MGPOptional<MGPNode<Rules<M, S, L, U>, M, S, L, U>> = this.node.getSonByMove(move);
            // let's not create the node twice
            if (choice.isPresent()) {
                assert(legality.isSuccess(), 'Rules.choose: Move is illegal: ' + legality.getReasonOr(''));
                display(LOCAL_VERBOSE, 'Rules.choose: and this proposed move is found in the list, so it is legal');
                this.node = choice.get(); // which becomes the current node
                return true;
            }
        }
        display(LOCAL_VERBOSE, `Rules.choose: current node has no moves or is pruned, let's verify ourselves`);
        if (legality.isFailure()) {
            display(LOCAL_VERBOSE, 'Rules.choose: Move is illegal: ' + legality.getReason());
            return false;
        } else {
            display(LOCAL_VERBOSE, `Rules.choose: Move is legal, let's apply it`);
        }

        const resultingState: GameState = this.applyLegalMove(move, this.node.gameState, legality.get());
        const son: MGPNode<Rules<M, S, L, U>, M, S, L, U> = new MGPNode(resultingState as S,
                                                                        MGPOptional.of(this.node),
                                                                        MGPOptional.of(move));
        this.node = son;
        return true;
    }
    /**
     * Applies a legal move, given the precomputed information `info`
     */
    public abstract applyLegalMove(move: M, state: S, info: L): S;
    /**
     * Returns success if the move is legal, with some potentially precomputed data.
     * If the move is illegal, returns a failure with information on why it is illegal
     */
    public abstract isLegal(move: M, state: S): MGPFallible<L>;

    public setInitialBoard(): void {
        if (this.node == null) {
            const initialState: S = this.stateType['getInitialState']();
            MGPNode.ruler = this;
            this.node = new MGPNode(initialState);
        } else {
            this.node = this.node.getInitialNode();
        }
    }
    public applyMoves(encodedMoves: number[], state: S, moveDecoder: (em: number) => M): S {
        let i: number = 0;
        for (const encodedMove of encodedMoves) {
            const move: M = moveDecoder(encodedMove);
            const legality: MGPFallible<L> = this.isLegal(move, state);
            assert(legality.isSuccess(), `Can't create state from invalid moves (` + i + '): ' + legality.toString() + '.');
            state = this.applyLegalMove(move, state, legality.get());
            i++;
        }
        return state;
    }
    public abstract getGameStatus(node: MGPNode<Rules<M, S, L>, M, S, L>): GameStatus;
}
