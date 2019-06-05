// import {Component, OnInit} from '@angular/core';
// import {P4Rules} from '../../../games/p4/P4Rules';
// import {MoveX} from '../../../jscaip/MoveX';
// import {UserService} from '../../../services/UserService';
// import {OfflineGame} from '../OfflineGame';
//
// @Component({
// 	selector: 'app-p4-offline',
// 	templateUrl: './p4-offline.component.html',
// 	styleUrls: ['./p4-offline.component.css']
// })
// export class P4OfflineComponent extends OfflineGame {
//
// 	imagesLocation = 'assets/images/';
// 	rules = new P4Rules();
// 	imagesNames: string[] = ['empty_circle.svg', 'yellow_circle.svg.png', 'brown_circle.svg.png'];
//
// 	constructor() {
// 		super();
// 	}
//
// 	updateBoard() {
// 		this.board = this.rules.node.gamePartSlice.getCopiedBoard();
// 		this.turn = this.rules.node.gamePartSlice.turn;
// 	}
//
// 	trackByCase(index: number, _case: number): number {
// 		return _case;
// 	}
//
// 	trackByLine(index: number, column: number[]): number[] {
// 		return column;
// 	}
//
// 	onClick(event: MouseEvent): boolean {
// 		if (this.rules.node.isEndGame()) {
// 			console.log('Malheureusement la partie est finie');
// 			return false;
// 		}
// 		const turn = this.rules.node.gamePartSlice.turn % 2;
// 		if ([this.playerOneIsMyBot, this.playerTwoIsMyBot][turn]) {
// 			console.log('AI take ages to play, AMARITE?');
// 			return false;
// 		}
//
// 		// human's turn
// 		const x: number = Number(event.srcElement.id.substring(2, 3));
// 		if (this.rules.choose(MoveX.get(x))) {
// 			// human make a correct move, let's see if it's AI Turn
// 			// and let's also update the board
// 			this.updateBoard();
// 			this.proposeAIToPlay();
// 			return true;
// 		} else {
// 			console.log('Mouvement illegal');
// 			return false;
// 		}
// 	}
//
// 	debugPrintArray(b: Array<Array<number>>) {
// 		for (const line of b) {
// 			console.log(line);
// 		}
// 	}
//
// 	debugModifyArray(b: Array<number>) {
// 		b[3] = 5;
// 	}
//
// 	debugReassignArray(b: Array<number>) {
// 		b = [-1, -1, -1, -1, -73];
// 	}
//
// }
