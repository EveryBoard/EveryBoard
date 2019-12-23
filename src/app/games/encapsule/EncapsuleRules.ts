import {Rules} from '../../jscaip/Rules';
import { MNode } from 'src/app/jscaip/MNode';
import { Move } from 'src/app/jscaip/Move';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { EncapsulePartSlice, EncapsuleCase, Player } from './EncapsulePartSlice';
import { EncapsuleMove } from './EncapsuleMove';
import { EncapsulePiece } from './EncapsulePiece';

export class EncapsuleRules extends Rules {

    setInitialBoard(): void {
        if (this.node == null) {
            this.node = MNode.getFirstNode(
                EncapsulePartSlice.getStartingSlice(),
                this);
        } else {
            this.node = this.node.getInitialNode();
        }
    }
    isLegal(move: EncapsuleMove): boolean {
        return EncapsuleRules.isLegal(this.node.gamePartSlice as EncapsulePartSlice, move);
    }
    static isLegal(slice: EncapsulePartSlice, move: EncapsuleMove): boolean {
        if (!EncapsuleRules.enoughPiecesRemains(slice, move)) {
            return false;
        }
        let boardCopy: number[][] = slice.getCopiedBoard();
        let piece: EncapsulePiece = move.piece === null ?
            EncapsuleCase.decode(boardCopy[move.startingCoord.y][move.startingCoord.y]).getBiggest() :
            move.piece;
        if (!EncapsuleRules.pieceBelongToCurrentPlayer(piece, slice.turn)) {
            return false;
        }
        let landingNumber: number = boardCopy[move.landingCoord.y][move.landingCoord.x];
        let landingCase: EncapsuleCase = EncapsuleCase.decode(landingNumber);
        if (!EncapsuleRules.caseCanReceivePiece(landingCase, piece)) {
            return false;
        }
        return true;
    }
    static enoughPiecesRemains(slice: EncapsulePartSlice, move: EncapsuleMove): boolean {
        return slice.getRemainingPiecesCopy().some(piece => piece === move.piece);
    }
    static pieceBelongToCurrentPlayer(piece: EncapsulePiece, turn: number): boolean {
        if (piece === EncapsulePiece.BIG_BLACK    ||
            piece === EncapsulePiece.MEDIUM_BLACK ||
            piece === EncapsulePiece.SMALL_BLACK) {
            return turn%2 === 0;
        } else if (piece === EncapsulePiece.BIG_WHITE    ||
                   piece === EncapsulePiece.MEDIUM_WHITE ||
                   piece === EncapsulePiece.SMALL_WHITE) {
            return turn%2 === 1;
        } else {
            return false;
        }
    }
    static caseCanReceivePiece(c: EncapsuleCase, piece: EncapsulePiece): boolean {
        let biggestPresent: EncapsulePiece = c.getBiggest();
        if (piece === EncapsulePiece.NONE) {
            throw new Error("Cannot move NONE on a case");
        }
        if (biggestPresent === EncapsulePiece.NONE) {
            return true; // empty
        }
        if (biggestPresent === EncapsulePiece.BIG_BLACK || biggestPresent === EncapsulePiece.BIG_WHITE) {
            return false; // already full
        } else if (biggestPresent === EncapsulePiece.MEDIUM_BLACK || biggestPresent === EncapsulePiece.MEDIUM_WHITE) {
            return piece === EncapsulePiece.BIG_BLACK || piece === EncapsulePiece.BIG_WHITE
        } else { // biggest is small
            return piece !== EncapsulePiece.SMALL_BLACK && piece !== EncapsulePiece.SMALL_WHITE; 
        }
    }
    choose(move: EncapsuleMove): boolean {
        if (this.isLegal(move)) {
            return false;
        }
        return false;
    }
    getBoardValue<R extends Rules>(n: MNode<R>): number {
        throw new Error("Method not implemented.");
    }

    getListMoves<R extends Rules>(n: MNode<R>): { key: Move; value: EncapsulePartSlice; }[] {
        throw new Error("Method not implemented.");
    }
}