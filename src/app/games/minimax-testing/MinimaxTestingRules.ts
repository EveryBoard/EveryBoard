import { Rules } from "src/app/jscaip/Rules";
import { MNode } from "src/app/jscaip/MNode";
import { MGPMap } from "src/app/collectionlib/MGPMap";
import { MinimaxTestingPartSlice } from "./MinimaxTestingPartSlice";
import { MinimaxTestingMove } from "./MinimaxTestingMove";
import { Coord } from "src/app/jscaip/Coord";
import { LegalityStatus } from "src/app/jscaip/LegalityStatus";

export class MinimaxTestingRules extends Rules<MinimaxTestingMove, MinimaxTestingPartSlice, LegalityStatus> {

    public applyLegalMove(move: MinimaxTestingMove, slice: MinimaxTestingPartSlice, status: LegalityStatus): { resultingMove: MinimaxTestingMove; resultingSlice: MinimaxTestingPartSlice; } {
        const newX: number = slice.location.x + (move.right === true ? 1 : 0);
        const newY: number = slice.location.y + (move.right === false ? 1 : 0);
        let newLocation: Coord = new Coord(newX, newY);
        return {
            resultingSlice: new MinimaxTestingPartSlice(slice.turn + 1, newLocation),
            resultingMove: move
        };
    }

    constructor(initialBoard: number[][]) {
        super();
        MinimaxTestingPartSlice.initialBoard = initialBoard;
        this.node = MNode.getFirstNode(
            new MinimaxTestingPartSlice(0, new Coord(0, 0)),
            this
        );
    }

    public setInitialBoard() {
        if (this.node == null) {
            this.node = MNode.getFirstNode(
                MinimaxTestingPartSlice.getStartingSlice(),
                this);
        } else {
            this.node = this.node.getInitialNode();
        }
    }

    public isLegal(move: MinimaxTestingMove): LegalityStatus {
        const ILLEGAL: LegalityStatus = {legal: false};
        const slice: MinimaxTestingPartSlice = this.node.gamePartSlice;
        const coord: Coord = slice.location;
        const board: number[][] = slice.getCopiedBoard();
        if (coord.x + 1 === board[0].length && move.right === true) {
            return ILLEGAL;
        }
        if (coord.y + 1 === board.length && move.right === false) {
            return ILLEGAL;
        }
        return {legal: true};
    }

    public getBoardValue(node: MNode<MinimaxTestingRules, MinimaxTestingMove, MinimaxTestingPartSlice, LegalityStatus>): number {
        const slice: MinimaxTestingPartSlice = node.gamePartSlice;
        return slice.getBoardAt(slice.location);
    }

    public getListMoves(n: MNode<MinimaxTestingRules, MinimaxTestingMove, MinimaxTestingPartSlice, LegalityStatus>): MGPMap<MinimaxTestingMove, MinimaxTestingPartSlice> {
        const result: MGPMap<MinimaxTestingMove, MinimaxTestingPartSlice> = new MGPMap<MinimaxTestingMove, MinimaxTestingPartSlice>();
        const slice: MinimaxTestingPartSlice = n.gamePartSlice;
        const LEGAL: LegalityStatus = {legal: true};
        if (slice.location.x < 3) {
            const rightMove: MinimaxTestingMove = MinimaxTestingMove.RIGHT;
            const rightSlice: MinimaxTestingPartSlice = this.applyLegalMove(rightMove, slice, LEGAL).resultingSlice;
            result.put(rightMove, rightSlice);
        }
        if (slice.location.y < 3) {
            const downMove: MinimaxTestingMove = MinimaxTestingMove.DOWN;
            const downSlice: MinimaxTestingPartSlice = this.applyLegalMove(downMove, slice, LEGAL).resultingSlice;
            result.put(downMove, downSlice);
        }
        return result;
    }
}