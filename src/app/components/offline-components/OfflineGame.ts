import {UserService} from '../../services/UserService';
import {MoveCoord} from '../../jscaip/MoveCoord';
import {Rules} from '../../jscaip/Rules';
import {Move} from '../../jscaip/Move';

export abstract class OfflineGame {
	rules: Rules;

	playerOneIsMyBot = false;
	playerTwoIsMyBot = false;
	aiDepth = 5;
	botTimeOut = 500; // this.aiDepth * 500;

	board: Array<Array<number>>;
	turn = 0;
	constructor(private userService: UserService) {
	}

	onInit() {
		// totally adaptable to other Rules
		// MNode.ruler = this.rules;
		this.rules.setInitialBoard();
		this.board = this.rules.node.gamePartSlice.getCopiedBoard();
	}

	proposeAIToPlay() {
		// check if ai's turn has come, if so, make her start after a delay
		const turn = this.rules.node.gamePartSlice.turn % 2;
		if ([this.playerOneIsMyBot, this.playerTwoIsMyBot][turn]) {
			// bot's turn
			setTimeout(() => {
				// called only when it's AI's Turn
				if (!this.rules.node.isEndGame()) {
					const aiMove: Move = this.rules.node.findBestMoveAndSetDepth(this.aiDepth).getMove();
					this.rules.choose(aiMove);
					this.updateBoard();
					this.proposeAIToPlay();
				}
			}, this.botTimeOut);
		}
	}

	public abstract updateBoard();

}
