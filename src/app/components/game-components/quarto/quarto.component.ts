import {Component} from '@angular/core';
import {QuartoMove} from '../../../games/quarto/quartomove/QuartoMove';
import {QuartoPartSlice} from '../../../games/quarto/QuartoPartSlice';
import {QuartoRules} from '../../../games/quarto/quartorules/QuartoRules';
import {QuartoEnum} from '../../../games/quarto/QuartoEnum';
import {AbstractGameComponent} from '../AbstractGameComponent';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { MGPValidation } from 'src/app/collectionlib/mgpvalidation/MGPValidation';

@Component({
    selector: 'app-quarto',
    templateUrl: './quarto.component.html'
})
export class QuartoComponent extends AbstractGameComponent<QuartoMove, QuartoPartSlice, LegalityStatus> {

    public rules = new QuartoRules(QuartoPartSlice);

    public chosen: Coord = new Coord(-1, -1);

    public lastMove: Coord = new Coord(-1, -1);

    public pieceInHand: QuartoEnum = this.rules.node.gamePartSlice.pieceInHand;
    // the piece that the current user must place on the board

    public pieceToGive: QuartoEnum = QuartoEnum.UNOCCUPIED; // the piece that the user want to give to the opponent

    public updateBoard() {
        const slice = this.rules.node.gamePartSlice;
        const move: QuartoMove = this.rules.node.move;
        this.board = slice.getCopiedBoard();
        this.pieceInHand = slice.pieceInHand;

        if (move != null) {
            this.lastMove = move.coord;
        } else {
            this.lastMove = null;
        }

        this.cancelMove();
    }
    /********************************** For Online Game **********************************/

    public decodeMove(encodedMove: number): QuartoMove {
        return QuartoMove.decode(encodedMove);
    }
    public encodeMove(move: QuartoMove): number {
        return move.encode();
    }
    // creating method for Quarto

    public async chooseCoord(x: number, y: number): Promise<MGPValidation> {
        // called when the user click on the quarto board

        this.hideLastMove(); // now the user tried to choose something
        // so I guess he don't need to see what's the last move of the opponent

        if (this.board[y][x] === QuartoEnum.UNOCCUPIED) {
            // if it's a legal place to put the piece
            this.showPieceInHandOnBoard(x, y); // let's show the user his decision
            if (this.rules.node.gamePartSlice.turn === 15) {
                // on last turn user won't be able to click on a piece to give
                // thereby we must put his piece in hand right
                return (await this.suggestMove(new QuartoMove(x, y, QuartoEnum.UNOCCUPIED))).onFailure(this.message);
            }
            if (this.pieceToGive !== -1) {
                // the user has already chosen his piece before his coord
                return (await this.suggestMove(new QuartoMove(x, y, this.pieceToGive))).onFailure(this.message);
            }
            return MGPValidation.success(); // the user has just chosen his coord
        }
        // the user chose an occupied place of the board, so an illegal move, so we cancel all
        this.cancelMove();
        return MGPValidation.failure("you cannot move from an empty case").onFailure(this.message);
    }
    public async choosePiece(givenPiece: number): Promise<MGPValidation> {
        this.hideLastMove(); // now the user tried to choose something
        // so I guess he don't need to see what's the last move of the opponent

        if (this.isRemaining(givenPiece)) {
            this.pieceToGive = givenPiece;
            if (this.chosen.x !== -1) {
                // the user has chosen the coord before the piece
                const chosenMove = new QuartoMove(this.chosen.x, this.chosen.y, this.pieceToGive);
                return (await this.suggestMove(chosenMove)).onFailure(this.message);
            }
            return MGPValidation.success(); // the user has just chosen his piece
        }
        // the user chose an empty piece, let's cancel this
        this.cancelMove();
        return MGPValidation.failure("you can't choose an empty piece");
    }
    public hideLastMove() {
        this.lastMove = new Coord(-1, -1);
    }
    public cancelMove() {
        // called when the user do a wrong move, then, we unselect his pieceToGive and/or the chosen coord
        this.chosen = new Coord(-1, -1);
        this.pieceToGive = -1;
    }
    public showPieceInHandOnBoard(x: number, y: number) {
        this.chosen = new Coord(x, y);
    }
    public isRemaining(pawn: number): boolean {
        return QuartoPartSlice.isGivable(pawn, this.board, this.pieceInHand);
    }
    public isHighlighted(x: number, y: number): boolean {
        const clickedCoord: Coord = new Coord(x, y);
        return clickedCoord.equals(this.lastMove) ||
               clickedCoord.equals(this.chosen);
    }
    // creating method for OnlineQuarto

    public async suggestMove(chosenMove: QuartoMove): Promise<MGPValidation> {
        const moveResult: MGPValidation = await this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
        if (moveResult.isSuccess()) {
            this.chosen = new Coord(-1, -1);
        } else {
            this.cancelMove();
        }
        return moveResult;
    }
}
