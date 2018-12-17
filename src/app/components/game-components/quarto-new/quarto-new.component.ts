import {Component, OnInit} from '@angular/core';
import {GameComponentComponent} from '../game-component/game-component.component';
import {Move} from '../../../jscaip/Move';
import {QuartoMove} from '../../../games/games.quarto/QuartoMove';
import {QuartoPartSlice} from '../../../games/games.quarto/QuartoPartSlice';
import {QuartoEnum} from '../../../games/games.quarto/QuartoEnum';
import {QuartoRules} from '../../../games/games.quarto/QuartoRules';
import {PartService} from '../../../services/partService';

@Component({
	selector: 'app-quarto-new',
	templateUrl: './quarto-new.component.html',
	styleUrls: ['./quarto-new.component.css']
})
export class QuartoNewComponent implements OnInit {

	rules = new QuartoRules();
	imagesLocation = 'gaviall/pantheonsgame/assets/images/quarto/'; // en prod
	// imagesLocation = 'src/assets/images/quarto/'; // en dev
	private choosenX = -1;
	private choosenY = -1;
	pieceInHand = 0;

	// common to all
	board: number[][];
	turn = 0;
	currentPlayer: string;

	constructor(private partService: PartService) {}

	ngOnInit() {
		this.partService.onInit(new QuartoRules(), this.updateBoard, this.decodeMove);
	}

	decodeMove(encodedMove: number): Move {
		return QuartoMove.decode(encodedMove);
	}

	updateBoard() {
		const quartoPartSlice = this.rules.node.gamePartSlice as QuartoPartSlice;
		this.board = quartoPartSlice.getCopiedBoard();
		this.turn = quartoPartSlice.turn;
		this.currentPlayer = this.partService.players[quartoPartSlice.turn % 2];

		this.pieceInHand = quartoPartSlice.pieceInHand;
	}

	updateDBBoard(move: QuartoMove) {
		const docRef = this.partService.partDocument.ref;
		docRef.get()
			.then((doc) => {
				const turn: number = doc.get('turn') + 1;
				const listMoves: number[] = doc.get('listMoves');
				listMoves[listMoves.length] = QuartoMove.encode(move);
				docRef.update({
					'listMoves': listMoves,
					'turn': turn
				});
			}).catch((error) => {
			console.log(error);
		});
	}

	chooseCoord(event: MouseEvent): boolean {
		if (!this.partService.isPlayerTurn()) {
			console.log('ce n\'est pas ton tour!');
			return false;
		}
		if (this.rules.node.isEndGame()) {
			console.log('la partie est finie');
			return false;
		}
		const x: number = Number(event.srcElement.id.substring(2, 3));
		const y: number = Number(event.srcElement.id.substring(1, 2));
		if (this.partService.board[y][x] === QuartoEnum.UNOCCUPIED) {
			this.putOnBoard(x, y);
			return true;
		}
		return false;
	}

	putOnBoard(x: number, y: number) {
		this.choosenX = x;
		this.choosenY = y;
		// TODO : enlever le précédent s'il y en
		// TODO : placer virtuellement la pieceInHand sur le board
	}

	choosePiece(event: MouseEvent): boolean {
		if (!this.partService.isPlayerTurn()) {
			console.log('ce n\'est pas ton tour!');
			return false;
		}
		if (this.rules.node.isEndGame()) {
			console.log('la partie est finie');
			return false;
		} // TODO : refactor ça avec chooseCoord
		if (this.choosenX === -1) {
			console.log('choisis une pièce d\'abord');
			return false;
		}
		const piece: number = Number(event.srcElement.id.substring(1));
		const choosedMove = new QuartoMove(this.choosenX, this.choosenY, piece);
		if (this.rules.choose(choosedMove)) {
			console.log('Et javascript estime que votre mouvement est légal');
			// player make a correct move
			// let's confirm on java-server-side that the move is legal
			this.choosenX = -1;
			this.choosenY = -1;
			this.updateDBBoard(choosedMove);
			if (this.rules.node.isEndGame()) {
				this.partService.notifyVictory();
			}
			return true;
		} else {
			console.log('Mais c\'est un mouvement illegal');
			return false;
		}
	}

	isRemaining(pawn: number) {
		return QuartoPartSlice.isGivable(pawn, this.partService.board, this.pieceInHand);
	}

}
