import {Move} from '../../jscaip/Move';
import {Rules} from '../../jscaip/Rules';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';

export abstract class AbstractGameComponent<M extends Move, S extends GamePartSlice, L extends LegalityStatus> {

	public rules: Rules<M, S, L>;

	public board: ReadonlyArray<ReadonlyArray<number>>;

	public canPass: boolean;

    public showScore: boolean;

    public imagesLocation = 'assets/images/'; // en prod';
    // imagesLocation = 'src/assets/images/'; // en dev

    public chooseMove: (move: Move, slice: GamePartSlice, scorePlayerZero: number, scorePlayerOne: number) => boolean;

	public observerRole: number;
	/* all game rules should be able to call the game-wrapper
	 * the aim is that the game-wrapper will take care of manage what follow
	 * ie:  - if it's online, he'll tell the game-component when the remote opponent has played
	 * 		- if it's offline, he'll tell the game-component what the bot have done
	 */

	public abstract updateBoard(): void;

	public abstract decodeMove(encodedMove: number): Move;

	public abstract encodeMove(move: Move): number;
}