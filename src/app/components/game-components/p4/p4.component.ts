import {Component, OnDestroy, OnInit} from '@angular/core';
import {OnlineGame} from '../OnlineGame';
import {GameInfoService} from '../../../services/game-info-service';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user-service';
import {UserDAO} from '../../../dao/UserDAO';
import {PartDAO} from '../../../dao/PartDAO';
import {Move} from '../../../jscaip/Move';
import {MoveX} from '../../../jscaip/MoveX';
import {P4PartSlice} from '../../../games/games.p4/P4PartSlice';
import {P4Rules} from '../../../games/games.p4/P4Rules';
import {JoinerService} from '../../../services/JoinerService';

@Component({
	selector: 'app-p4',
	templateUrl: './p4.component.html',
	styleUrls: ['./p4.component.css']
})
export class P4Component extends OnlineGame implements OnInit, OnDestroy {

	rules = new P4Rules();

	// imagesLocation = 'gaviall/pantheonsgame/assets/images/'; // en prod
	imagesLocation = 'src/assets/images/'; // en dev

	imagesNames: string[] = ['empty_circle.svg', 'yellow_circle.svg.png', 'brown_circle.svg.png'];

	constructor(gameInfoService: GameInfoService,	_route: Router,
				userService: UserService,			userDao: UserDAO,
				partDao: PartDAO, joinerService: JoinerService) {
		super(gameInfoService, _route, userService, userDao, partDao, joinerService);
	}

	ngOnInit() {
		this.onInit();
	}

	ngOnDestroy() {
		this.onDestroy();
	}

	decodeMove(encodedMove: number): Move {
		return MoveX.get(encodedMove);
	}

	encodeMove(move: MoveX): number {
		return move.x;
	}

	updateBoard(): void {
		const p4PartSlice: P4PartSlice = this.rules.node.gamePartSlice;
		this.board = p4PartSlice.getCopiedBoard();
		this.turn = p4PartSlice.turn;
		this.currentPlayer = this.players[p4PartSlice.turn % 2];
	}

	choose(event: MouseEvent): boolean {
		if (!this.isPlayerTurn()) {
			console.log('Mais c\'est pas ton tour !');
			return false;
		}
		const x: number = Number(event.srcElement.id.substring(2, 3));
		console.log('vous tentez un mouvement en colonne ' + x);

		if (this.rules.node.isEndGame()) {
			console.log('Malheureusement la partie est finie');
			// todo : option de clonage revision commentage
			return false;
		}

		console.log('ça tente bien c\'est votre tour');
		// player's turn
		const choosedMove = MoveX.get(x);
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

}
