import {Component, OnInit} from '@angular/core';
import {P4Rules} from '../../../games/games.p4/P4Rules';
import {MoveX} from '../../../jscaip/MoveX';
import {UserService} from '../../../services/user-service';

@Component({
	selector: 'app-p4-offline',
	templateUrl: './p4-offline.component.html',
	styleUrls: ['./p4-offline.component.css']
})
export class P4OfflineComponent implements OnInit {

	rules = new P4Rules();
	playerOneIsMyBot = false;
	playerTwoIsMyBot = false;
	aiDepth = 5;
	botTimeOut = 500; // this.aiDepth * 500;
	board: Array<Array<number>>;

	imagesLocation = 'gaviall/pantheonsgame/assets/images/'; // en prod :
	imagesNames: string[] = ['empty_circle.svg', 'yellow_circle.svg.png', 'brown_circle.svg.png'];

	constructor(private userService: UserService) {}

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
		this.board = this.rules.node.gamePartSlice.getCopiedBoard();
		const statique: number = P4Rules._getBoardValue(this.rules.node);

		console.log('boardValue = ' + statique);
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
		this.userService.updateUserActivity();
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
