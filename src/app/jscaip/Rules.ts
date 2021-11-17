import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Move } from './Move';
import { LegalityStatus } from './LegalityStatus';
import { Type } from '@angular/core';
import { assert, display } from '../utils/utils';
import { Player } from './Player';
import { AbstractGameState } from './GameState';

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
                            S extends AbstractGameState,
                            L extends LegalityStatus = LegalityStatus>
{

    public constructor(public readonly stateType: Type<S>) {
        this.setInitialBoard();
    }
    public node: MGPNode<Rules<M, S, L>, M, S, L>;
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
        const status: L = this.isLegal(move, this.node.gameState);
        if (this.node.hasMoves()) { // if calculation has already been done by the AI
            display(LOCAL_VERBOSE, 'Rules.choose: current node has moves');
            const choice: MGPNode<Rules<M, S, L>, M, S, L> = this.node.getSonByMove(move);
            // let's not create the node twice
            if (choice != null) {
                assert(status.legal.isSuccess(), 'Rules.choose: Move is illegal: ' + status.legal.reason);
                display(LOCAL_VERBOSE, 'Rules.choose: and this proposed move is found in the list, so it is legal');
                this.node = choice; // which become the current node
                return true;
            }
        }
        display(LOCAL_VERBOSE, `Rules.choose: current node has no moves or is pruned, let's verify ourselves`);
        if (status.legal.isFailure()) {
            display(LOCAL_VERBOSE, 'Rules.choose: Move is illegal: ' + status.legal.getReason());
            return false;
        } else {
            display(LOCAL_VERBOSE, `Rules.choose: Move is legal, let's apply it`);
        }

        const resultingState: AbstractGameState = this.applyLegalMove(move, this.node.gameState, status);
        const son: MGPNode<Rules<M, S, L>, M, S, L> = new MGPNode(resultingState as S,
                                                                  this.node,
                                                                  move);
        this.node = son;
        return true;
    }
    public abstract applyLegalMove(move: M, state: S, status: L): S;

    public abstract isLegal(move: M, state: S): L;
    /* return a legality status about the move, allowing to return already calculated info
     * don't do any modification to the board
     */
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
            const status: L = this.isLegal(move, state);
            if (status.legal.isFailure()) {
                throw new Error(`Can't create state from invalid moves (` + i + '): ' + status.legal.reason + '.');
            }
            state = this.applyLegalMove(move, state, status);
            i++;
        }
        return state;
    }
    public abstract getGameStatus(node: MGPNode<Rules<M, S, L>, M, S, L>): GameStatus;
}
