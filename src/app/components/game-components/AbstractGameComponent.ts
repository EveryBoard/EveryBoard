import {Move} from '../../jscaip/Move';
import {Rules} from '../../jscaip/Rules';

export abstract class AbstractGameComponent {

	rules: Rules;
	board: Array<Array<number>>;

	canPass: boolean;
	chooseMove: (move: Move) => boolean;
	observerRole: number;
	/* all game rules should be able to call the game-wrapper
	 * the aim is that the game-wrapper will take care of manage what follow
	 * ie:  - if it's online, he'll tell the game-component when the remote opponent has played
	 * 		- if it's offline, he'll tell the game-component what the bot have done
	 */

	// abstract applyExternalMove(move: Move); TODO: delete since it seem's useless
	/* Allow game-wrapper to inject a move from the AI or the remote opponent to the Game Component
	 * Reminder: the Game Component don't know who's playing
	 * Game Component focus on translating user-interactions to Moves, and Moves to visible Board
	 */

	abstract updateBoard(): void;

	abstract decodeMove(encodedMove: number): Move;

	abstract encodeMove(move: Move): number;

}
