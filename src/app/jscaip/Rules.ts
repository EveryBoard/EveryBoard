import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Move } from './Move';
import { GamePartSlice } from './GamePartSlice';
import { LegalityStatus } from './LegalityStatus';
import { Type } from '@angular/core';
import { display } from '../utils/utils';
import { NodeUnheritance } from './NodeUnheritance';
import { Player } from './Player';

export class GameStatus {

    public static readonly ZERO_WON: GameStatus = new GameStatus(true, Player.ZERO);

    public static readonly ONE_WON: GameStatus = new GameStatus(true, Player.ONE);

    public static readonly DRAW: GameStatus = new GameStatus(true, Player.NONE);

    public static readonly ONGOING: GameStatus = new GameStatus(false, Player.NONE);

    public static getVictory(nonNonePlayer: Player): GameStatus {
        if (nonNonePlayer === Player.ZERO) {
            return GameStatus.ZERO_WON;
        } else {
            return GameStatus.ONE_WON;
        }
    }
    public static getDefeat(nonNonePlayer: Player): GameStatus {
        if (nonNonePlayer === Player.ZERO) {
            return GameStatus.ONE_WON;
        } else {
            return GameStatus.ZERO_WON;
        }
    }
    private constructor(public readonly isEndGame: boolean, public readonly winner: Player) {
    }
}
export abstract class Rules<M extends Move,
                            S extends GamePartSlice,
                            L extends LegalityStatus = LegalityStatus,
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

    public readonly choose: (move: M) => boolean = (move: M): boolean => { // TODO: make a normal function
        /* used by the rules to update board
         * return true if the move was legal, and the node updated
         * return false otherwise
         */
        const LOCAL_VERBOSE: boolean = false;
        display(LOCAL_VERBOSE, 'Rules.choose: ' + move.toString() + ' was proposed');
        if (this.node.hasMoves()) { // if calculation has already been done by the AI
            display(LOCAL_VERBOSE, 'Rules.choose: current node has moves');
            const choix: MGPNode<Rules<M, S, L, U>, M, S, L, U> =
                this.node.getSonByMove(move);// let's not doing it twice
            if (choix !== null) {
                display(LOCAL_VERBOSE, 'Rules.choose: and this proposed move is found in the list, so it is legal');
                this.node = choix; // qui devient le plateau actuel
                return true;
            }
        }
        display(LOCAL_VERBOSE, 'Rules.choose: current node has no moves or is pruned, let\'s verify ourselves');
        const status: LegalityStatus = this.isLegal(move, this.node.gamePartSlice);
        if (status.legal.isFailure()) {
            display(LOCAL_VERBOSE, 'Rules.choose: Move is illegal: ' + status.legal.getReason());
            return false;
        } else display(LOCAL_VERBOSE, 'Rules.choose: Move is legal, let\'s apply it');

        const resultingSlice: GamePartSlice = MGPNode.ruler.applyLegalMove(move, this.node.gamePartSlice, status);
        const son: MGPNode<Rules<M, S, L, U>, M, S, L, U> = new MGPNode(this.node,
                                                                        move,
                                                                        resultingSlice as S);
        this.node = son;
        return true;
    };
    public abstract applyLegalMove(move: M, slice: S, status: L): S;

    public abstract isLegal(move: M, slice: S): L;
    /* return a legality status about the move, allowing to return already calculated info
     * don't do any modification to the board
     */
    public setInitialBoard(): void {
        if (this.node == null) {
            const initialSlice: S = this.stateType['getInitialSlice']();
            this.node = MGPNode.getFirstNode(initialSlice, this);
        } else {
            this.node = this.node.getInitialNode();
        }
    }
    public applyMoves(encodedMoves: number[], slice: S, moveDecoder: (em: number) => M): S {
        let i: number = 0;
        for (const encodedMove of encodedMoves) {
            const move: M = moveDecoder(encodedMove);
            const status: L = this.isLegal(move, slice);
            if (status.legal.isFailure()) {
                throw new Error('Can\'t create slice from invalid moves (' + i + '): ' + status.legal.reason + '.');
            }
            slice = this.applyLegalMove(move, slice, status);
            i++;
        }
        return slice;
    }
    public abstract getGameStatus(state: S, lastMove: M): GameStatus;
}
