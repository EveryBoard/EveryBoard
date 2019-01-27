import {Component} from '@angular/core';
import {OnlineGame} from '../OnlineGame';
import {MoveCoordToCoordAndCapture} from '../../../jscaip/MoveCoordToCoordAndCapture';
import {Coord} from '../../../jscaip/Coord';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../services/UserService';
import {JoinerService} from '../../../services/JoinerService';
import {TablutRules} from '../../../games/tablut/TablutRules';
import {TablutPartSlice} from '../../../games/tablut/TablutPartSlice';
import {GameService} from '../../../services/GameService';

@Component({
	selector: 'app-tablut',
	templateUrl: './tablut.component.html'
})
export class TablutComponent extends OnlineGame {

	rules = new TablutRules();

	imagesLocation = 'assets/images/'; // en prod';
	// imagesLocation = 'src/assets/images/'; // en dev
	imagesNames: string[] = ['unoccupied.svg', 'king.svg', 'king.svg', 'invaders.svg', 'defender.svg'];
	UNOCCUPIED = 0;

	movingX = -1; // coord of the piece who left
	movingY = -1;
	arrivingX = -1; // coord of the piece who arrived
	arrivingY = -1;
	choosenX = -1;
	choosenY = -1;

	constructor(_route: Router, actRoute: ActivatedRoute, userService: UserService,
				joinerService: JoinerService, partService: GameService) {
		super(_route, actRoute, userService, joinerService, partService);
	}

	updateBoard() {
		const tablutPartSlice = this.rules.node.gamePartSlice as TablutPartSlice;
		const move = this.rules.node.getMove() as MoveCoordToCoordAndCapture;
		this.board = tablutPartSlice.getCopiedBoard();
		this.turn = tablutPartSlice.turn;
		this.currentPlayer = this.players[tablutPartSlice.turn % 2];

		if (move != null) {
			this.movingX = move.coord.x;
			this.movingY = move.coord.y;
			this.arrivingX = move.end.x;
			this.arrivingY = move.end.y;
		}

		this.cancelMove();
	}

	suggestMove(choosedMove: MoveCoordToCoordAndCapture): boolean {
		let result: boolean;
		if (this.rules.choose(choosedMove)) {
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
			this.cancelMove();
		}
		return result;
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
		const x: number = Number(event.srcElement.id.substring(2, 3));
		const y: number = Number(event.srcElement.id.substring(1, 2));

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
		const choosedDestination: Coord = new Coord(x, y);
		return this.suggestMove(new MoveCoordToCoordAndCapture(choosedPiece, choosedDestination));
	}

	choosePiece(event: MouseEvent): boolean {
		const x: number = Number(event.srcElement.id.substring(2, 3));
		const y: number = Number(event.srcElement.id.substring(1, 2));

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
		this.hideLastMove(); // now the user tried to choose something
		// so I guess he don't need to see what's the last move of the opponent

		if (this.pieceBelongToPlayer(x, y)) {
			this.showSelectedPiece(x, y);
			console.log('selected piece = (' + x + ', ' + y + ')');
			return true;
		}
		this.cancelMove();
		console.log('no selected piece');
		return false;
	}

	pieceBelongToPlayer(x: number, y: number) {
		if (this.observerRole > 1) {
			throw new Error('pieceBelongToPlayer cannot be called by an observer');
		}
		const player = this.observerRole === 0 ? 0 : 1;
		const invaderStart = (this.rules.node.gamePartSlice as TablutPartSlice).invaderStart;
		const coord: Coord = new Coord(x, y);
		return TablutRules.getRelativeOwner(player, invaderStart, coord, this.board);
	}

	hideLastMove() {
		this.movingX = -1;
		this.movingY = -1;
		this.arrivingX = -1;
		this.arrivingY = -1;
	}

	cancelMove() {
		this.choosenX = -1;
		this.choosenY = -1;
	}

	isThrone(x: number, y: number): boolean {
		return TablutRules.isThrone(new Coord(x, y));
	}

	showSelectedPiece(x: number, y: number) {
		this.choosenX = x;
		this.choosenY = y;
		// TODO : enlever le précédent s'il y en
		// TODO : placer virtuellement la pieceInHand sur le board
	}

	decodeMove(encodedMove: number): MoveCoordToCoordAndCapture {
		const ay = encodedMove % 16;
		encodedMove = encodedMove / 16;
		encodedMove -= encodedMove % 1;
		const ax = encodedMove % 16;
		const arrive: Coord = new Coord(ax, ay);
		encodedMove = encodedMove / 16;
		encodedMove -= encodedMove % 1;
		const dy = encodedMove % 16;
		encodedMove = encodedMove / 16;
		encodedMove -= encodedMove % 1;
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
