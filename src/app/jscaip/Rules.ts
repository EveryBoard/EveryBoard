import {MNode} from './MNode';
import {Move} from './Move';
import {GamePartSlice} from './GamePartSlice';
import { MGPMap } from '../collectionlib/MGPMap';
import { LegalityStatus } from './LegalityStatus';

export abstract class Rules<M extends Move, S extends GamePartSlice, L extends LegalityStatus> {

    public node: MNode<Rules<M, S, L>, M, S, L>; // TODO: check that this should not made static
    /* The data that represent the status of the game at the current moment, including:
     * the board
     * the turn
     * the extra data that might be score of each player
     * the remaining pawn that you can put on the board...
     */

    public abstract getListMoves(node: MNode<Rules<M, S, L>, M, S, L>): MGPMap<M, S> ;
    /* has to be implemented for each rule so that the AI can choose amongst theses informations
     * this function could give an incomplete set of data if some of them are redondant
     * or also if some of them are too bad to be interesting to count, as a matter of performance
     */

    public abstract getBoardValue(node: MNode<Rules<M, S, L>, M, S, L>): number;
    /* used to give a comparable data type linked to the gameSlicePart of the moment
     * so that the AI can know what is best, according to you algorithm in there
     */

    public readonly choose = (move: M): boolean => {
        /* used by the rules to update board
         * return true if the move was legal, and the node updated
         * return false otherwise
         */
        const LOCAL_VERBOSE = true;
        if (this.node.hasMoves()) { // if calculation has already been done by the AI
            let choix: MNode<Rules<M, S, L>, M, S, L> = this.node.getSonByMove(move);// let's not doing if twice
            if (choix === null) {
                return false;
            } else {
                this.node = choix; // qui devient le plateau actuel
                return true;
            }
        }
        const status: LegalityStatus = this.isLegal(move, this.node.gamePartSlice);
        if (!status.legal) return false;

        const result: {resultingMove: Move, resultingSlice: GamePartSlice} = MNode.ruler.applyLegalMove(move, this.node.gamePartSlice, status);
        const son: MNode<Rules<M, S, L>, M, S, L> = new MNode(this.node, result.resultingMove as M, result.resultingSlice as S);
        this.node = son;
        return true;
    };

    public abstract applyLegalMove(move: M, slice: S, status: L): {resultingMove: M, resultingSlice: S};

    public abstract isLegal(move: M, slice: S): L;
    /* return a legality status about the move, allowing to return already calculated info
     * don't do any modification to the board
     */

    public abstract setInitialBoard(): void;
    /* set the initial board
     */
}