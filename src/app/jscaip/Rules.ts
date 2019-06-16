import {MNode} from './MNode';
import {Move} from './Move';
import {GamePartSlice} from './GamePartSlice';

export abstract class Rules {

	public node: MNode<Rules>; // TODO vérifier si il ne faut pas le rendre static
	/* The data that represent the status of the game at the current moment, including:
     *   the board
     *   the turn
     *   the extra data that might be score of each player
     *   the remaining pawn that you can put on the board
     */

	abstract getListMoves<R extends Rules>(n: MNode<R>): { key: Move, value: GamePartSlice }[] ;
	/* has to be implemented for each rule so that the AI can choose amongst theses informations
     * this function could give an incomplete set of data if some of them are redondant
     * or also if some of them are too bad to be interesting to count, as a matter of performance
     */

	abstract getBoardValue<R extends Rules>(n: MNode<R>): number;
	/* used to give a comparable data type linked to the gameSlicePart of the moment
     * so that the AI can know what is best, according to you algorithm in there
     */

	abstract choose(move: Move): boolean;
	/* used by the rules to update board
     * return true if the move was legal, and the node updated
     * return false otherwise
     */

	abstract isLegal(move: Move): boolean;
	/* return true if the move is legal
	 * don't do any modification to the board
	 */

	abstract setInitialBoard(): void;
	/* set the initial board
     */

}
