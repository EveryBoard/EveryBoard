import {Component, OnDestroy, OnInit} from '@angular/core';
import {OnlineGame} from '../OnlineGame';
import {MoveCoordToCoordAndCapture} from '../../../jscaip/MoveCoordToCoordAndCapture';
import {Coord} from '../../../jscaip/Coord';
import {GameInfoService} from '../../../services/game-info-service';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user-service';
import {UserDAO} from '../../../dao/UserDAO';
import {PartDAO} from '../../../dao/PartDAO';
import {JoinerService} from '../../../services/JoinerService';
import {TablutRules} from '../../../games/tablut/TablutRules';
import {TablutPartSlice} from '../../../games/tablut/TablutPartSlice';

@Component({
	selector: 'app-tablut',
	templateUrl: './tablut.component.html',
	styleUrls: ['./tablut.component.css']
})
export class TablutComponent extends OnlineGame implements OnInit, OnDestroy {

	rules = new TablutRules();

	imagesLocation = 'gaviall/pantheonsgame/assets/images/tablut/'; // en prod
	// imagesLocation = 'src/assets/images/tablut/'; // en dev
	imagesNames: string[] = ['unoccupied.svg', 'king.svg', 'king.svg', 'invaders.svg', 'defender.svg'];

	choosenX = -1;
	choosenY = -1;

	constructor(gameInfoService: GameInfoService, _route: Router, userService: UserService,
				userDao: UserDAO, partDao: PartDAO, joinerService: JoinerService) {
		super(gameInfoService, _route, userService, userDao, partDao, joinerService);
	}

	ngOnInit() {
		this.onInit();
	}

	ngOnDestroy() {
		this.onDestroy();
	}

	updateBoard() {
		const tablutPartSlice = this.rules.node.gamePartSlice as TablutPartSlice;
		const move = this.rules.node.getMove() as MoveCoordToCoordAndCapture;
		this.board = tablutPartSlice.getCopiedBoard();
		this.turn = tablutPartSlice.turn;
		this.currentPlayer = this.players[tablutPartSlice.turn % 2];

		this.choosenX = move.coord.x;
		this.choosenY = move.coord.y;
	}

	suggestMove(choosedMove: MoveCoordToCoordAndCapture): boolean {
		let result: boolean;
		TablutRules.VERBOSE = true;
		if (this.rules.choose(choosedMove)) {
			TablutRules.VERBOSE = false;
			console.log('Et javascript estime que votre mouvement est légal');
			// player make a correct move
			// let's confirm on java-server-side that the move is legal
			this.updateDBBoard(choosedMove);
			if (this.rules.node.isEndGame()) {
				if (this.rules.node.getOwnValue() === 0) {
					this.notifyDraw();
				} else {
					this.notifyVictory();
				}
			}
			result = true;
		} else {
			console.log('Mais c\'est un mouvement illegal');
			result = false;
		}
		this.unSelectPiece();
		return result;
	}

	unSelectPiece() {
		this.choosenX = -1;
		this.choosenY = -1;
	}

	onClick(event: MouseEvent) {
		console.log('onClick');
		if (this.choosenX === -1) {
			this.choosePiece(event);
		} else {
			this.chooseDestination(event);
		}
	}

	chooseDestination(event: MouseEvent): boolean {
		console.log('chooseDestination');
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
		} // TODO : vérifier au moins que la case n'est pas occupée
		console.log('piece choisie, partie en cours, c\'est ton tour');
		const choosedPiece: Coord = new Coord(this.choosenX, this.choosenY);
		const x: number = Number(event.srcElement.id.substring(2, 3));
		const y: number = Number(event.srcElement.id.substring(1, 2));
		const choosedDestination: Coord = new Coord(x, y);
		return this.suggestMove(new MoveCoordToCoordAndCapture(choosedPiece, choosedDestination));
	}

	choosePiece(event: MouseEvent): boolean {
		console.log('choosePiece');
		if (!this.isPlayerTurn()) {
			console.log('ce n\'est pas ton tour!');
			return false;
		}
		console.log('c\'est ton tour');
		if (this.rules.node.isEndGame()) {
			console.log('la partie est finie');
			return false;
		}
		const x: number = Number(event.srcElement.id.substring(2, 3));
		const y: number = Number(event.srcElement.id.substring(1, 2));
		if (this.board[y][x] !== TablutPartSlice.UNOCCUPIED) {
			this.showSelectedPiece(x, y);
			console.log('selected piece = (' + x + ', ' + y + ')');
			return true;
		}
		console.log('no selected piece');
		return false;
	}

	showSelectedPiece(x: number, y: number) {
		this.choosenX = x;
		this.choosenY = y;
		// TODO : enlever le précédent s'il y en
		// TODO : placer virtuellement la pieceInHand sur le board
	}

	decodeMove(encodedMove: number): MoveCoordToCoordAndCapture {
		const ay = encodedMove % 16;
		encodedMove = encodedMove / 16; encodedMove -= encodedMove % 1;
		const ax = encodedMove % 16;
		const arrive: Coord = new Coord(ax, ay);
		encodedMove = encodedMove / 16; encodedMove -= encodedMove % 1;
		const dy = encodedMove % 16;
		encodedMove = encodedMove / 16; encodedMove -= encodedMove % 1;
		const dx = encodedMove % 16;
		const depart: Coord = new Coord(dx, dy);
		return new MoveCoordToCoordAndCapture(depart, arrive);
	}

	encodeMove(move: MoveCoordToCoordAndCapture): number {
		// encoded as (binarywise) A(x, y) -> B(X, Y)
		// all value are between 0 and 8, so encoded on four bits
		// dxdx dydy axax ayay
		// no need to send the capture
		const dx: number = move.coord.x;
		const dy: number = move.coord.y;
		const ax: number = move.end.x;
		const ay: number = move.end.y;
		return (dx * 4096) + (dy * 256) + (ax * 16) + ay;
	}

}
