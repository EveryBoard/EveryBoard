import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Move } from './Move';
import { GamePartSlice } from './GamePartSlice';
import { MGPMap } from '../utils/mgp-map/MGPMap';
import { LegalityStatus } from './LegalityStatus';
import { Type } from '@angular/core';
import { MGPValidation } from '../utils/mgp-validation/MGPValidation';
import { display } from '../utils/utils/utils';
import { NodeUnheritance } from './NodeUnheritance';

export class RulesFailure {

    public static readonly CANNOT_CHOOSE_ENNEMY_PIECE: string =
        `Vous ne pouvez pas choisir une pièce de l'ennemi.`;
    public static readonly MUST_CLICK_ON_EMPTY_CASE: MGPValidation =
        MGPValidation.failure('Vous devez cliquer sur une case vide.');

    private constructor() {}
}

export abstract class Rules<M extends Move,
                            S extends GamePartSlice,
                            L extends LegalityStatus = LegalityStatus,
                            U extends NodeUnheritance = NodeUnheritance>
{

    public constructor(public readonly stateType: Type<S>) { // TODO: Make singleton ?
        this.setInitialBoard();
    }
    public node: MGPNode<Rules<M, S, L, U>, M, S, L, U>; // TODO: check that this should not made static
    /* The data that represent the status of the game at the current moment, including:
     * the board
     * the turn
     * the extra data that might be score of each player
     * the remaining pawn that you can put on the board...
     */

    public abstract getListMoves(node: MGPNode<Rules<M, S, L, U>, M, S, L, U>): MGPMap<M, S>;
    /* has to be implemented for each rule so that the AI can choose amongst theses informations
     * this function could give an incomplete set of data if some of them are redondant
     * or also if some of them are too bad to be interesting to count, as a matter of performance
     */

    public getBoardNumericValue(move: M, state: S): number {
        const boardInfo: unknown = this.getBoardValue(move, state);
        if (typeof boardInfo === 'number') {
            return boardInfo;
        } else {
            return (boardInfo as U).value;
        }
    }
    public abstract getBoardValue(move: M, slice: S): number | U;
    /* used to give a comparable data type linked to the gameSlicePart of the moment
     * so that the AI can know what is best, according to you algorithm in there
     */

    public readonly choose: (move: M) => boolean = (move: M): boolean => {
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
            // TODO: decide if usefull part
        }
        display(LOCAL_VERBOSE, 'Rules.choose: current node has no moves or is pruned, let\'s verify ourselves');
        const status: LegalityStatus = this.isLegal(move, this.node.gamePartSlice);
        if (status.legal.isFailure()) {
            display(LOCAL_VERBOSE, 'Rules.choose: Move is illegal: ' + status.legal.getReason());
            return false;
        } else display(LOCAL_VERBOSE, 'Rules.choose: Move is legal, let\'s apply it');

        const resultingSlice: GamePartSlice = MGPNode.ruler.applyLegalMove(move, this.node.gamePartSlice, status);
        const boardInfo: unknown = MGPNode.ruler.getBoardValue(move, resultingSlice);
        let boardValue: number;
        let unheritance: U;
        if (typeof boardInfo === 'number') {
            boardValue = boardInfo;
        } else {
            boardValue = (boardInfo as U).value;
            unheritance = boardInfo as U;
        }
        const son: MGPNode<Rules<M, S, L, U>, M, S, L, U> = new MGPNode(this.node,
                                                                        move as M, // TODO: check cast use
                                                                        resultingSlice as S,
                                                                        boardValue,
                                                                        unheritance);
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
}
