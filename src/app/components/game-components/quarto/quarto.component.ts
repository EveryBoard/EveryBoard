import { Component } from '@angular/core';
import { QuartoMove } from '../../../games/quarto/QuartoMove';
import { QuartoPartSlice } from '../../../games/quarto/QuartoPartSlice';
import { QuartoRules } from '../../../games/quarto/QuartoRules';
import { QuartoPiece } from '../../../games/quarto/QuartoPiece';
import { AbstractGameComponent } from '../abstract-game-component/AbstractGameComponent';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';

@Component({
    selector: 'app-quarto',
    templateUrl: './quarto.component.html',
})
export class QuartoComponent extends AbstractGameComponent<QuartoMove, QuartoPartSlice> {
    public rules: QuartoRules = new QuartoRules(QuartoPartSlice);

    public chosen: Coord = new Coord(-1, -1);

    public lastMove: Coord = new Coord(-1, -1);

    public pieceInHand: QuartoPiece = this.rules.node.gamePartSlice.pieceInHand;
    // the piece that the current user must place on the board

    public pieceToGive: QuartoPiece = QuartoPiece.NONE; // the piece that the user want to give to the opponent

    public updateBoard(): void {
        const slice: QuartoPartSlice = this.rules.node.gamePartSlice;
        const move: QuartoMove = this.rules.node.move;
        this.board = slice.getCopiedBoard();
        this.pieceInHand = slice.pieceInHand;

        if (move != null) {
            this.lastMove = move.coord;
        } else {
            this.lastMove = null;
        }
    }
    /** ******************************** For Online Game **********************************/

    public decodeMove(encodedMove: number): QuartoMove {
        return QuartoMove.decode(encodedMove);
    }
    public encodeMove(move: QuartoMove): number {
        return move.encode();
    }
    // creating method for Quarto

    public async chooseCoord(x: number, y: number): Promise<MGPValidation> {
        // called when the user click on the quarto board
        const clickValidity: MGPValidation = this.canUserPlay('#chooseCoord_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        this.hideLastMove(); // now the user tried to choose something
        // so I guess he don't need to see what's the last move of the opponent

        if (this.board[y][x] === QuartoPiece.NONE.value) {
            // if it's a legal place to put the piece
            this.showPieceInHandOnBoard(x, y); // let's show the user his decision
            if (this.rules.node.gamePartSlice.turn === 15) {
                // on last turn user won't be able to click on a piece to give
                // thereby we must put his piece in hand right
                const chosenMove: QuartoMove = new QuartoMove(x, y, QuartoPiece.NONE);
                return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
            } else if (this.pieceToGive === QuartoPiece.NONE) {
                return MGPValidation.SUCCESS; // the user has just chosen his coord
            } else {
                // the user has already chosen his piece before his coord
                const chosenMove: QuartoMove = new QuartoMove(x, y, this.pieceToGive);
                return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
            }
        } else {
            // the user chose an occupied place of the board, so an illegal move, so we cancel all
            return this.cancelMove('Choisissez une case vide.');
        }
    }
    public async choosePiece(givenPiece: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#choosePiece_' + givenPiece);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        this.hideLastMove(); // now the user tried to choose something
        // so I guess he don't need to see what's the last move of the opponent

        this.pieceToGive = QuartoPiece.fromInt(givenPiece);
        if (this.chosen.x === -1) {
            return MGPValidation.SUCCESS; // the user has just chosen his piece
        } else {
            // the user has chosen the coord before the piece
            const chosenMove: QuartoMove = new QuartoMove(this.chosen.x, this.chosen.y, this.pieceToGive);
            return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
        }
    }
    private hideLastMove(): void {
        this.lastMove = new Coord(-1, -1);
    }
    public cancelMoveAttempt(): void {
        this.chosen = new Coord(-1, -1);
        this.pieceToGive = QuartoPiece.NONE;
    }
    private showPieceInHandOnBoard(x: number, y: number): void {
        this.chosen = new Coord(x, y);
    }
    public isRemaining(pawn: number): boolean {
        return QuartoPartSlice.isGivable(QuartoPiece.fromInt(pawn), this.board, this.pieceInHand);
    }
    public isHighlighted(x: number, y: number): boolean {
        const clickedCoord: Coord = new Coord(x, y);
        return clickedCoord.equals(this.lastMove) ||
               clickedCoord.equals(this.chosen);
    }
}
