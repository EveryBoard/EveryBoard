import {Component, OnInit} from '@angular/core';
import {AwaleRules} from '../../../games/awale/AwaleRules';
import {AwalePartSlice} from '../../../games/awale/AwalePartSlice';
import {UserService} from '../../../services/UserService';
import {MoveCoord} from '../../../jscaip/MoveCoord';
import {OfflineGame} from '../OfflineGame';
import {Move} from '../../../jscaip/Move';

@Component({
	selector: 'app-awale-offline',
	templateUrl: './awale-offline.component.html',
	styleUrls: ['./awale-offline.component.css']
})
export class AwaleOfflineComponent extends OfflineGame {

	playerOneIsMyBot = false;
	playerTwoIsMyBot = false;
	aiDepth = 5;
	botTimeOut = 500; // this.aiDepth * 500;
	board: Array<Array<number>>;
	turn = 0;

	imagesLocation = 'assets/images/circled_numbers/';
	captured: number[] = [0, 0];
	rules = new AwaleRules();

	constructor() {
		super();
	}

	updateBoard() {
		const awalePartSlice: AwalePartSlice = this.rules.node.gamePartSlice as AwalePartSlice;
		this.board = awalePartSlice.getCopiedBoard();
		// const statique: number = this.rules.getBoardValue(this.rules.node);
		this.captured = awalePartSlice.captured;
		this.turn = this.rules.node.gamePartSlice.turn;
		// console.log('boardValue = ' + statique);
	}

	trackByCase(index: number, _case: number): number {
		return _case;
	}

	trackByLine(index: number, column: number[]): number[] {
		return column;
	}

	choose(event: MouseEvent): boolean {
		if (this.rules.node.isEndGame()) {
			console.log('La partie est finie');
			return false;
		}

		// the game is not ended
		const turn = this.rules.node.gamePartSlice.turn % 2;
		if ([this.playerOneIsMyBot, this.playerTwoIsMyBot][turn]) {
			console.log('AI take ages to play, AMARITE?');
			return false;
		}

		// human's turn
		const x: number = Number(event.srcElement.id.substring(2, 3));
		const y: number = Number(event.srcElement.id.substring(1, 2));
		console.log('vous tentez un mouvement en ' + x + '(' + event.srcElement.id + ')');
		if (this.rules.choose(new MoveCoord(x, y))) {
			// human make a correct move, let's see if it's AI Turn
			// and let's also update the board
			this.updateBoard();
			this.proposeAIToPlay();
			return true;
		} else {
			console.log('Mouvement illegal');
			return false;
		}
	}

}
