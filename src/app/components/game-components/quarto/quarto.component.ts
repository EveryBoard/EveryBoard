import {Component} from '@angular/core';
import {Move} from '../../../jscaip/Move';
import {QuartoMove} from '../../../games/games.quarto/QuartoMove';
import {QuartoPartSlice} from '../../../games/games.quarto/QuartoPartSlice';
import {QuartoRules} from '../../../games/games.quarto/QuartoRules';
import {QuartoEnum} from '../../../games/games.quarto/QuartoEnum';
import {AbstractGameComponent} from '../AbstractGameComponent';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Coord } from 'src/app/jscaip/Coord';

@Component({
	selector: 'app-quarto',
	templateUrl: './quarto.component.html'
})
export class QuartoComponent extends AbstractGameComponent<QuartoMove, QuartoPartSlice, LegalityStatus> {

    public VERBOSE: boolean = false;

	public rules = new QuartoRules();

	public chosen: Coord = new Coord(-1, -1);

    public lastMove: Coord = new Coord(-1, -1);

	public pieceInHand: number = 0; // the piece that the current user must place on the board

    public pieceToGive: number = -1; // the piece that the user want to give to the opponent

	public updateBoard() {
		if (this.VERBOSE) console.log('update online board');
		const slice = this.rules.node.gamePartSlice;
		const move: QuartoMove = this.rules.node.move;
		this.board = slice.getCopiedBoard();
		this.pieceInHand = slice.pieceInHand;

		if (move != null) {
			this.lastMove = move.coord;
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

	public chooseCoord(x: number, y: number): boolean {
		if (this.VERBOSE) console.log('choose coord');
		// called when the user click on the quarto board
		if (this.rules.node.isEndGame()) {
			if (this.VERBOSE) console.log('la partie est finie');
			return false;
		}
		this.hideLastMove(); // now the user tried to choose something
		// so I guess he don't need to see what's the last move of the opponent

		if (this.board[y][x] === QuartoEnum.UNOCCUPIED) {
			if (this.VERBOSE) console.log('legal place to put the piece because ' + x + ', ' + y + ' : ' + this.board[y][x]);
			// if it's a legal place to put the piece
			this.showPieceInHandOnBoard(x, y); // let's show the user his decision
			if (this.rules.node.gamePartSlice.turn === 15) {
				// on last turn user won't be able to click on a piece to give
				// thereby we must put his piece in hand right
				return this.suggestMove(new QuartoMove(x, y, QuartoEnum.UNOCCUPIED));
			}
			if (this.pieceToGive !== -1) {
				// the user has already chosen his piece before his coord
				return this.suggestMove(new QuartoMove(x, y, this.pieceToGive));
			}
			return true; // the user has just chosen his coord
		}
		if (this.VERBOSE) console.log('NOT a legal place to put the piece because ' + +x + ', ' + y + ' : ' + this.board[y][x]);
		// the user chose an occupied place of the board, so an illegal move, so we cancel all
		this.cancelMove();
		return false;
	}
	public choosePiece(givenPiece: number): boolean {
		if (this.rules.node.isEndGame()) {
			if (this.VERBOSE) console.log('la partie est finie');
			return false;
		}
		this.hideLastMove(); // now the user tried to choose something
		// so I guess he don't need to see what's the last move of the opponent

		if (this.isRemaining(givenPiece)) {
			this.pieceToGive = givenPiece;
			if (this.chosen.x !== -1) {
				// the user has chosen the coord before the piece
				const chosenMove = new QuartoMove(this.chosen.x, this.chosen.y, this.pieceToGive);
				return this.suggestMove(chosenMove);
			}
			return true; // the user has just chosen his piece
		}
		// the user chose an empty piece, let's cancel this
		this.cancelMove();
		return false;
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
	public isRemaining(pawn: number) {
		return QuartoPartSlice.isGivable(pawn, this.board, this.pieceInHand);
	}
	// creating method for OnlineQuarto

	public suggestMove(chosenMove: QuartoMove): boolean {
		if (this.rules.isLegal(chosenMove)) {
			if (this.VERBOSE) console.log('Et javascript estime que votre mouvement est légal');
			// player make a correct move
			// let's confirm on java-server-side that the move is legal
			this.chosen = new Coord(-1, -1);
			this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
			return true;
		} else {
			if (this.VERBOSE) console.log('Mais c\'est un mouvement illegal');
			return false;
		}
	}
}