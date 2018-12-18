import {Component, OnDestroy, OnInit} from '@angular/core';
import {Move} from '../../../jscaip/Move';

import {QuartoMove} from '../../../games/games.quarto/QuartoMove';
import {QuartoPartSlice} from '../../../games/games.quarto/QuartoPartSlice';
import {QuartoEnum} from '../../../games/games.quarto/QuartoEnum';
import {QuartoRules} from '../../../games/games.quarto/QuartoRules';
import {OnlineGame} from '../OnlineGame';
import {GameInfoService} from '../../../services/game-info-service';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user-service';
import {UserDAO} from '../../../dao/UserDAO';
import {PartDAO} from '../../../dao/PartDAO';

@Component({
	selector: 'app-quarto',
	templateUrl: './quarto.component.html',
	styleUrls: ['./quarto.component.css']
})
export class QuartoComponent extends OnlineGame implements OnInit, OnDestroy {

	rules = new QuartoRules();

	// imagesLocation = 'gaviall/pantheonsgame/assets/images/quarto/'; // en prod
	imagesLocation = 'src/assets/images/quarto/'; // en dev

	private choosenX = -1;
	private choosenY = -1;
	pieceInHand = 0;

	constructor(gameInfoService: GameInfoService, _route: Router, userService: UserService, userDao: UserDAO, partDao: PartDAO) {
		super(gameInfoService, _route, userService, userDao, partDao);
	}

	ngOnInit() {
		this.onInit();
	}

	ngOnDestroy() {
		this.onDestroy();
	}

	decodeMove(encodedMove: number): Move {
		return QuartoMove.decode(encodedMove);
	}

	encodeMove(move: QuartoMove): number {
		return QuartoMove.encode(move);
	}

	updateBoard() {
		const quartoPartSlice = this.rules.node.gamePartSlice as QuartoPartSlice;
		this.board = quartoPartSlice.getCopiedBoard();
		this.turn = quartoPartSlice.turn;
		this.currentPlayer = this.players[quartoPartSlice.turn % 2];

		this.pieceInHand = quartoPartSlice.pieceInHand;
	}

	chooseCoord(event: MouseEvent): boolean {
		if (!this.isPlayerTurn()) {
			console.log('ce n\'est pas ton tour!');
			return false;
		}
		if (this.rules.node.isEndGame()) {
			console.log('la partie est finie');
			return false;
		}
		const x: number = Number(event.srcElement.id.substring(2, 3));
		const y: number = Number(event.srcElement.id.substring(1, 2));
		if (this.board[y][x] === QuartoEnum.UNOCCUPIED) {
			this.putOnBoard(x, y);
			if (this.turn === 15) {
				// plus de pièce à placer, on place automatiquement
				return this.suggestMove(new QuartoMove(x, y, QuartoEnum.UNOCCUPIED));
			}
			return true;
		}
		return false;
	}

	suggestMove(choosedMove: QuartoMove): boolean {
		if (this.rules.choose(choosedMove)) {
			console.log('Et javascript estime que votre mouvement est légal');
			// player make a correct move
			// let's confirm on java-server-side that the move is legal
			this.choosenX = -1;
			this.choosenY = -1;
			this.updateDBBoard(choosedMove);
			if (this.rules.node.isEndGame()) {
				if (this.rules.node.getOwnValue() === 0) {
					this.notifyDraw();
				} else {
					this.notifyVictory();
				}
			}
			return true;
		} else {
			console.log('Mais c\'est un mouvement illegal');
			return false;
		}
	}

	putOnBoard(x: number, y: number) {
		this.choosenX = x;
		this.choosenY = y;
		// TODO : enlever le précédent s'il y en
		// TODO : placer virtuellement la pieceInHand sur le board
	}

	choosePiece(event: MouseEvent): boolean {
		if (!this.isPlayerTurn()) {
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
		return this.suggestMove(choosedMove);
	}

	isRemaining(pawn: number) {
		return QuartoPartSlice.isGivable(pawn, this.board, this.pieceInHand);
	}

}
