import {MNode} from './MNode';
import {Move} from './Move';
import {GamePartSlice} from './GamePartSlice';
import { MGPMap } from '../collectionlib/MGPMap';

export abstract class Rules<M extends Move, S extends GamePartSlice> {

    public node: MNode<Rules<M, S>, M, S>; // TODO vérifier si il ne faut pas le rendre static
    /* The data that represent the status of the game at the current moment, including:
     *   the board
     *   the turn
     *   the extra data that might be score of each player
     *   the remaining pawn that you can put on the board
     */

    public abstract getListMoves(n: MNode<Rules<M, S>, M, S>): MGPMap<M, S> ;
    /* has to be implemented for each rule so that the AI can choose amongst theses informations
     * this function could give an incomplete set of data if some of them are redondant
     * or also if some of them are too bad to be interesting to count, as a matter of performance
     */

    public abstract getBoardValue(n: MNode<Rules<M, S>, M, S>): number;
    /* used to give a comparable data type linked to the gameSlicePart of the moment
     * so that the AI can know what is best, according to you algorithm in there
     */

    public abstract choose(move: M): boolean;
    /* used by the rules to update board
     * return true if the move was legal, and the node updated
     * return false otherwise
     */

    public abstract isLegal(move: M): boolean;
    /* return true if the move is legal
     * don't do any modification to the board
     */

    public abstract setInitialBoard(): void;
    /* set the initial board
     */
}