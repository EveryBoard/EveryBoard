import { MGPNode } from 'src/app/jscaip/mgpnode/MGPNode';
import { Move } from './Move';
import { GamePartSlice } from './GamePartSlice';
import { MGPMap } from '../collectionlib/mgpmap/MGPMap';
import { LegalityStatus } from './LegalityStatus';

export abstract class Rules<M extends Move, S extends GamePartSlice, L extends LegalityStatus> {

    public static display(verbose: boolean, message: any) {
        if (verbose) console.log(message);
    }
    public constructor() {}

    public node: MGPNode<Rules<M, S, L>, M, S, L>; // TODO: check that this should not made static
    /* The data that represent the status of the game at the current moment, including:
     * the board
     * the turn
     * the extra data that might be score of each player
     * the remaining pawn that you can put on the board...
     */

    public abstract getListMoves(node: MGPNode<Rules<M, S, L>, M, S, L>): MGPMap<M, S> ;
    /* has to be implemented for each rule so that the AI can choose amongst theses informations
     * this function could give an incomplete set of data if some of them are redondant
     * or also if some of them are too bad to be interesting to count, as a matter of performance
     */

    public abstract getBoardValue(move: M, slice: S): number;
    /* used to give a comparable data type linked to the gameSlicePart of the moment
     * so that the AI can know what is best, according to you algorithm in there
     */

    public readonly choose = (move: M): boolean => {
        /* used by the rules to update board
         * return true if the move was legal, and the node updated
         * return false otherwise
         */
        const LOCAL_VERBOSE: boolean = false;
        Rules.display(LOCAL_VERBOSE, "Rules.choose: " + move.toString() + " was proposed");
        if (this.node.hasMoves()) { // if calculation has already been done by the AI
            Rules.display(LOCAL_VERBOSE, "Rules.choose: current node has moves");
            let choix: MGPNode<Rules<M, S, L>, M, S, L> = this.node.getSonByMove(move);// let's not doing it twice
            if (choix !== null) {
                Rules.display(LOCAL_VERBOSE, "Rules.choose: and this proposed move is found in the list, so it is legal");
                this.node = choix; // qui devient le plateau actuel
                return true;
            }
            // TODO: decide if usefull part
        }
        Rules.display(LOCAL_VERBOSE, "Rules.choose: current node has no moves or is pruned, let's verify ourselves");
        const status: LegalityStatus = this.isLegal(move, this.node.gamePartSlice);
        if (!status.legal) {
            Rules.display(LOCAL_VERBOSE, "Rules.choose: Move is illegal");
            return false;
        } else Rules.display(LOCAL_VERBOSE, "Rules.choose: Move is legal, let's apply it");

        const result: {resultingMove: Move, resultingSlice: GamePartSlice} = MGPNode.ruler.applyLegalMove(move, this.node.gamePartSlice, status);
        const boardValue: number = MGPNode.ruler.getBoardValue(result.resultingMove, result.resultingSlice);
        const son: MGPNode<Rules<M, S, L>, M, S, L> = new MGPNode(
            this.node,
            result.resultingMove as M,
            result.resultingSlice as S,
            boardValue);
        this.node = son;
        return true;
    };

    public abstract applyLegalMove(move: M, slice: S, status: L): {resultingMove: M, resultingSlice: S};

    public abstract isLegal(move: M, slice: S): L;
    /* return a legality status about the move, allowing to return already calculated info
     * don't do any modification to the board
     */

    public abstract setInitialBoard(): void;  // TODO: make generic and unherited
    /* set the initial board
     */
}