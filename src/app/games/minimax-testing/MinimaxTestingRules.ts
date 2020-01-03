import { Rules } from "src/app/jscaip/Rules";
import { MNode } from "src/app/jscaip/MNode";
import { MGPMap } from "src/app/collectionlib/MGPMap";
import { MinimaxTestingPartSlice } from "./MinimaxTestingPartSlice";
import { MinimaxTestingMove } from "./MinimaxTestingMove";
import { Coord } from "src/app/jscaip/Coord";

export class MinimaxTestingRules extends Rules {

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

    public isLegal(move: MinimaxTestingMove): boolean {
        const slice: MinimaxTestingPartSlice = this.node.gamePartSlice as MinimaxTestingPartSlice;
        const coord: Coord = slice.location;
        const board: number[][] = slice.getCopiedBoard();
        if (coord.x + 1 === board[0].length && move.right === true) {
            return false;
        }
        if (coord.y + 1 === board.length && move.right === false) {
            return false;
        }
        return true;
    }

    public choose(move: MinimaxTestingMove): boolean {
        if (!this.isLegal(move)) {
            return false;
        }

        const newPartSlice: MinimaxTestingPartSlice = MinimaxTestingRules.applyLegalMove(this.node.gamePartSlice as MinimaxTestingPartSlice, move);
        const son: MNode<MinimaxTestingRules> = new MNode(this.node, move, newPartSlice);
        this.node = son;
        return true;
    }

    static applyLegalMove(slice: MinimaxTestingPartSlice, move: MinimaxTestingMove): MinimaxTestingPartSlice {
        const newX: number = slice.location.x + (move.right === true ? 1 : 0);
        const newY: number = slice.location.y + (move.right === false ? 1 : 0);
        let newLocation: Coord = new Coord(newX, newY);
        return new MinimaxTestingPartSlice(slice.turn + 1, newLocation);
    }

    public getBoardValue(n: MNode<MinimaxTestingRules>): number {
        const slice: MinimaxTestingPartSlice = n.gamePartSlice as MinimaxTestingPartSlice;
        return slice.getBoardAt(slice.location);
    }

    public getListMoves(n: MNode<MinimaxTestingRules>): MGPMap<MinimaxTestingMove, MinimaxTestingPartSlice> {
        const result: MGPMap<MinimaxTestingMove, MinimaxTestingPartSlice> = new MGPMap<MinimaxTestingMove, MinimaxTestingPartSlice>();
        const slice: MinimaxTestingPartSlice = n.gamePartSlice as MinimaxTestingPartSlice;
        if (slice.location.x < 3) {
            const rightMove: MinimaxTestingMove = MinimaxTestingMove.RIGHT;
            const rightSlice: MinimaxTestingPartSlice = MinimaxTestingRules.applyLegalMove(slice, rightMove);
            result.put(rightMove, rightSlice);
        }
        if (slice.location.y < 3) {
            const downMove: MinimaxTestingMove = MinimaxTestingMove.DOWN;
            const downSlice: MinimaxTestingPartSlice = MinimaxTestingRules.applyLegalMove(slice, downMove);
            result.put(downMove, downSlice);
        }
        return result;
    }
}