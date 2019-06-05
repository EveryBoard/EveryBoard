// import {Component} from '@angular/core';
// import {ActivatedRoute, Router} from '@angular/router';
//
// import {OnlineGame} from '../OnlineGame';
// import {Move} from '../../../jscaip/Move';
//
// import {MoveX} from '../../../jscaip/MoveX';
// import {P4PartSlice} from '../../../games/p4/P4PartSlice';
// import {P4Rules} from '../../../games/p4/P4Rules';
//
// import {JoinerService} from '../../../services/JoinerService';
// import {GameService} from '../../../services/GameService';
// import {UserService} from '../../../services/UserService';
//
// @Component({
// 	selector: 'app-p4',
// 	templateUrl: './p4-old.component.html',
// 	styleUrls: ['../onlineGame.css']
// })
// export class P4OldComponent extends OnlineGame {
//
// 	rules = new P4Rules();
//
// 	imagesLocation = 'assets/images/';
//
// 	imagesNames: string[] = ['empty_circle.svg', 'yellow_circle.svg.png', 'brown_circle.svg.png'];
//
// 	lastX: number;
//
// 	constructor(_route: Router, actRoute: ActivatedRoute,
// 				userService: UserService,
// 				joinerService: JoinerService, partService: GameService) {
// 		super(_route, actRoute, userService, joinerService, partService);
// 	}
//
// 	decodeMove(encodedMove: number): Move {
// 		return MoveX.get(encodedMove);
// 	}
//
// 	encodeMove(move: MoveX): number {
// 		return move.x;
// 	}
//
// 	updateBoard(): void {
// 		const p4PartSlice: P4PartSlice = this.rules.node.gamePartSlice;
// 		const lastMove: MoveX = this.rules.node.getMove() as MoveX;
//
// 		this.board = p4PartSlice.getCopiedBoard().reverse();
// 		this.turn = p4PartSlice.turn;
// 		this.currentPlayer = this.players[p4PartSlice.turn % 2];
//
// 		if (lastMove !== null) {
// 			this.lastX = lastMove.x;
// 		}
// 	}
//
// 	onClick(x: number): boolean {
// 		if (this.rules.node.isEndGame()) {
// 			console.log('Malheureusement la partie est finie');
// 			return false;
// 		}
// 		if (!this.isPlayerTurn()) {
// 			console.log('Mais c\'est pas ton tour !');
// 			return false;
// 		}
//
// 		// player's turn
// 		const chosenMove = MoveX.get(x);
// 		if (this.rules.isLegal(chosenMove)) {
// 			console.log('Et javascript estime que votre mouvement est légal');
// 			// player make a correct move
// 			// let's confirm on java-server-side that the move is legal
// 			this.updateDBBoard(chosenMove);
// 			/* if (this.rules.node.isEndGame()) {
// 				if (this.rules.node.getOwnValue() === 0) {
// 					this.notifyDraw();
// 				} else {
// 					this.notifyVictory();
// 				}
// 			} */ // OLDLY
// 		} else {
// 			console.log('Mais c\'est un mouvement illegal');
// 		}
// 	}
//
// }
