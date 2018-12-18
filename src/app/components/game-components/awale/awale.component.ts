import {Component, OnInit} from '@angular/core';
import {GameInfoService} from '../../../services/game-info-service';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user-service';
import {UserDAO} from '../../../dao/UserDAO';
import {PartDAO} from '../../../dao/PartDAO';
import {OnlineGame} from '../OnlineGame';
import {MoveX} from '../../../jscaip/MoveX';
import {AwaleRules} from '../../../games/games.awale/AwaleRules';
import {MoveCoord} from '../../../jscaip/MoveCoord';
import {AwalePartSlice} from '../../../games/games.awale/AwalePartSlice';

@Component({
	selector: 'app-awale',
	templateUrl: './awale.component.html',
	styleUrls: ['./awale.component.css']
})
export class AwaleComponent extends OnlineGame implements OnInit {

	rules = new AwaleRules();

	captured: number[] = [0, 0];

	imagesLocation = 'gaviall/pantheonsgame/assets/images/circled_numbers/';

	constructor(gameInfoService: GameInfoService, _route: Router, userService: UserService, userDao: UserDAO, partDao: PartDAO) {
		super(gameInfoService, _route, userService, userDao, partDao);
	}

	ngOnInit() {
		this.onInit();
	}

	choose(event: MouseEvent): boolean {
		if (!this.isPlayerTurn()) {
			console.log('Mais c\'est pas ton tour !'); // todo : réactive notification
			return false;
		}
		const x: number = Number(event.srcElement.id.substring(2, 3));
		const y: number = Number(event.srcElement.id.substring(1, 2));
		console.log('vous tentez un mouvement en colonne ' + x);

		if (this.rules.node.isEndGame()) {
			console.log('Malheureusement la partie est finie');
			// todo : option de clonage revision commentage
			return false;
		}

		console.log('ça tente bien c\'est votre tour');
		// player's turn
		const choosedMove = new MoveCoord(x, y);
		if (this.rules.choose(choosedMove)) {
			console.log('Et javascript estime que votre mouvement est légal');
			// player make a correct move
			// let's confirm on java-server-side that the move is legal
			this.updateDBBoard(MoveX.get(x));
			if (this.rules.node.isEndGame()) {
				this.notifyVictory();
			}
		} else {
			console.log('Mais c\'est un mouvement illegal');
		}
	}

	decodeMove(encodedMove: number): MoveX {
		return MoveX.get(encodedMove);
	}

	encodeMove(move: MoveX): number {
		return move.x;
	}

	updateBoard(): void {
		const awalePartSlice: AwalePartSlice = this.rules.node.gamePartSlice as AwalePartSlice;
		this.board = awalePartSlice.getCopiedBoard();
		this.turn = awalePartSlice.turn;
		this.currentPlayer = this.players[awalePartSlice.turn % 2];

		this.captured = awalePartSlice.getCapturedCopy();
	}

}
