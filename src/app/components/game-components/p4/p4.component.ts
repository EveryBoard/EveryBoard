import {Component} from '@angular/core';
import {OnlineGame} from '../OnlineGame';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../services/UserService';
import {Move} from '../../../jscaip/Move';
import {MoveX} from '../../../jscaip/MoveX';
import {P4PartSlice} from '../../../games/games.p4/P4PartSlice';
import {P4Rules} from '../../../games/games.p4/P4Rules';
import {JoinerService} from '../../../services/JoinerService';
import {GameService} from '../../../services/game.service';

@Component({
	selector: 'app-p4',
	templateUrl: './p4.component.html',
	styleUrls: ['./p4.component.css']
})
export class P4Component extends OnlineGame {

	rules = new P4Rules();

	imagesLocation = 'assets/images/'; // en prod
	// imagesLocation = 'src/assets/images/'; // en dev

	imagesNames: string[] = ['empty_circle.svg', 'yellow_circle.svg.png', 'brown_circle.svg.png'];

	lastX: number;

	constructor(_route: Router, actRoute: ActivatedRoute,
				userService: UserService,
				joinerService: JoinerService, partService: GameService) {
		super(_route, actRoute, userService, joinerService, partService);
	}

	decodeMove(encodedMove: number): Move {
		return MoveX.get(encodedMove);
	}

	encodeMove(move: MoveX): number {
		return move.x;
	}

	updateBoard(): void {
		const p4PartSlice: P4PartSlice = this.rules.node.gamePartSlice;
		const lastMove: MoveX = this.rules.node.getMove() as MoveX;

		this.board = p4PartSlice.getCopiedBoard();
		this.turn = p4PartSlice.turn;
		this.currentPlayer = this.players[p4PartSlice.turn % 2];

		if (lastMove !== null) {
			this.lastX = lastMove.x;
		}
	}

	onClick(event: MouseEvent): boolean {
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
