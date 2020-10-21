import { MNode } from "src/app/jscaip/MNode";
import { LegalityStatus } from "src/app/jscaip/LegalityStatus";
import { DvonnPartSlice } from "../DvonnPartSlice";
import { DvonnMove } from "../dvonnmove/DvonnMove";
import { Rules } from "src/app/jscaip/Rules";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { Coord } from "src/app/jscaip/coord/Coord";
import { ArrayUtils } from "src/app/collectionlib/arrayutils/ArrayUtils";
import { DvonnBoard } from "../DvonnBoard";

type DvonnLegalityStatus = { legal: boolean, slice: DvonnPartSlice }

abstract class DvonnNode extends MNode<DvonnRules, DvonnMove, DvonnPartSlice, LegalityStatus> { }

export class DvonnRules extends Rules<DvonnMove, DvonnPartSlice, LegalityStatus> {
    constructor(initialSlice: DvonnPartSlice) {
        super(false);
        this.node = MNode.getFirstNode(initialSlice, this);
        this
    }
    public static getMovablePieces(slice: DvonnPartSlice): Coord[] {
        // Movable pieces are the one with less than 6 neighbors
        const pieces: Coord[] = [];
        for (let x = 0; x < DvonnBoard.WIDTH; x++) {
            for (let y = 0; y < DvonnBoard.HEIGHT; y++) {
                const coord = new Coord(x, y);
                if (DvonnBoard.getStackAt(slice.board, coord).belongsTo(slice.getCurrentPlayer()) &&
                    DvonnBoard.numberOfNeighbors(slice.board, coord) < 6) {
                    pieces.push(coord);
                }
            }
        }
        return pieces;
    }
    public static getListMovesFromSlice(slice: DvonnPartSlice): MGPMap<DvonnMove, DvonnPartSlice> {
        throw new Error("NYI");
    }
    public getListMoves(node: DvonnNode): MGPMap<DvonnMove, DvonnPartSlice> {
        return DvonnRules.getListMovesFromSlice(node.gamePartSlice);
    }
    public getBoardValue(move: DvonnMove, slice: DvonnPartSlice): number {
//        let p0_score = 
//        for (let x = 0; x < DvonnBoard.WIDTH; x++) {
//            for (let y = 0; y < DvonnBoard.HEIGHT; y++) {
//                const stack = DvonnBoard.getStackAt(slice.board, new Coord(x, y));
                
        // Board values is the total number of pieces controlled by the player
        throw new Error("NYI");
    }
    public static tryMove(slice: DvonnPartSlice, move: DvonnMove)
        : { success: boolean, slice: DvonnPartSlice } {
        throw new Error("NYI");
    }
    public applyLegalMove(move: DvonnMove, slice: DvonnPartSlice, status: DvonnLegalityStatus)
        : { resultingMove: DvonnMove, resultingSlice: DvonnPartSlice } {
        const resultingSlice: DvonnPartSlice = status.slice;
        return { resultingSlice, resultingMove: move };
    }
    public isLegal(move: DvonnMove, slice: DvonnPartSlice): DvonnLegalityStatus {
        const resultFromMove = DvonnRules.tryMove(slice, move);
        return { legal: resultFromMove.success, slice: resultFromMove.slice };
    }
    public setInitialBoard(): void {
        if (this.node == null) {
            this.node = MNode.getFirstNode(DvonnPartSlice.getStartingSlice(ArrayUtils.mapBiArray(DvonnBoard.getBalancedBoard(), p => p.getValue())), this);
        } else {
            this.node = this.node.getInitialNode();
        }
    }
}
