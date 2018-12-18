import {Component, OnDestroy, OnInit} from '@angular/core';
import {GameInfoService} from '../../../services/game-info-service';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user-service';
import {UserDAO} from '../../../dao/UserDAO';
import {PartDAO} from '../../../dao/PartDAO';
import {OnlineGame} from '../OnlineGame';
import {AwaleRules} from '../../../games/games.awale/AwaleRules';
import {MoveCoord} from '../../../jscaip/MoveCoord';
import {AwalePartSlice} from '../../../games/games.awale/AwalePartSlice';

@Component({
	selector: 'app-awale',
	templateUrl: './awale.component.html',
	styleUrls: ['./awale.component.css']
})
export class AwaleComponent extends OnlineGame implements OnInit, OnDestroy {

	rules = new AwaleRules();

	captured: number[] = [0, 0];

	// imagesLocation = 'gaviall/pantheonsgame/assets/images/circled_numbers/'; // en prod
	imagesLocation = 'src/assets/images/circled_numbers/';

	constructor(gameInfoService: GameInfoService, _route: Router, userService: UserService, userDao: UserDAO, partDao: PartDAO) {
		super(gameInfoService, _route, userService, userDao, partDao);
	}

	ngOnInit() {
		this.onInit();
	}

	ngOnDestroy() {
		this.onDestroy();
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
			this.updateDBBoard(choosedMove);
			if (this.rules.node.isEndGame()) {
				if (this.rules.node.getOwnValue() === 0) {
					this.notifyDraw();
				} else {
					this.notifyVictory();
				}
			}
		} else {
			console.log('Mais c\'est un mouvement illegal');
		}
	}

	decodeMove(encodedMove: number): MoveCoord {
		const x = encodedMove % 6;
		const y = (encodedMove - x) / 6;
		return new MoveCoord(x, y);
	}

	encodeMove(move: MoveCoord): number {
		// An awalé move goes on x from o to 5
		// and y from 0 to 1
		// encoded as y*6 + x
		return (move.coord.y * 6) + move.coord.x;
	}

	updateBoard(): void {
		const awalePartSlice: AwalePartSlice = this.rules.node.gamePartSlice as AwalePartSlice;
		this.board = awalePartSlice.getCopiedBoard();
		this.turn = awalePartSlice.turn;
		this.currentPlayer = this.players[awalePartSlice.turn % 2];

		this.captured = awalePartSlice.getCapturedCopy();
	}

}
