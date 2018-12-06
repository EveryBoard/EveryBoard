import {Component, OnInit} from '@angular/core';
import {AwaleRules} from '../../../games/games.awale/AwaleRules';
import {MoveX} from '../../../jscaip/MoveX';
import {AwalePartSlice} from '../../../games/games.awale/AwalePartSlice';

@Component({
	selector: 'app-awale-offline',
	templateUrl: './awale-offline.component.html',
	styleUrls: ['./awale-offline.component.css']
})
export class AwaleOfflineComponent implements OnInit {

	rules = new AwaleRules();
	playerOneIsMyBot = false;
	playerTwoIsMyBot = false;
	aiDepth = 5;
	botTimeOut = 500; // this.aiDepth * 500;
	board: Array<Array<number>>;
	captured: number[] = [0, 0];
	turn = 0;

	imagesLocation = 'gaviall/pantheonsgame/assets/images/circled_numbers/';

	constructor() {
	}

	ngOnInit() {
		// totally adaptable to other Rules
		// MNode.ruler = this.rules;
		this.rules.setInitialBoard();
		this.board = this.rules.node.gamePartSlice.getCopiedBoard();
	}

	proposeAIToPlay() {
		// check if ai's turn has come, if so, make her play after a delay
		const turn = this.rules.node.gamePartSlice.turn % 2;
		if ([this.playerOneIsMyBot, this.playerTwoIsMyBot][turn]) {
			// bot's turn
			setTimeout(() => {
				// called only when it's AI's Turn
				if (!this.rules.node.isEndGame()) {
					const aiMove: MoveX = <MoveX>this.rules.node.findBestMoveAndSetDepth(this.aiDepth).getMove();
					this.rules.choose(aiMove);
					this.updateBoard();
					this.proposeAIToPlay();
				}
			}, this.botTimeOut);
		}
	}

	updateBoard() {
		const awalePartSlice: AwalePartSlice = this.rules.node.gamePartSlice as AwalePartSlice;
		this.board = awalePartSlice.getCopiedBoard();
		// const statique: number = this.rules.getBoardValue(this.rules.node);
		this.captured = awalePartSlice.captured;
		this.turn = this.rules.node.gamePartSlice.turn;
		// console.log('boardValue = ' + statique);
	}

	switchPlayerOne() { // totally adaptable to other Rules
		this.playerOneIsMyBot = !this.playerOneIsMyBot;
		this.proposeAIToPlay();
	}

	switchPlayerTwo() { // totally adaptable to other Rules
		this.playerTwoIsMyBot = !this.playerTwoIsMyBot;
		this.proposeAIToPlay();
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
		console.log('vous tentez un mouvement en ' + x + '(' + event.srcElement.id + ')');
		if (this.rules.choose(MoveX.get(x))) {
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

	debugPrintArray(b: Array<Array<number>>) {
		for (const line of b) {
			console.log(line);
		}
	}

	debugModifyArray(b: Array<number>) {
		b[3] = 5;
	}

	debugReassignArray(b: Array<number>) {
		b = [-1, -1, -1, -1, -73];
	}

}
