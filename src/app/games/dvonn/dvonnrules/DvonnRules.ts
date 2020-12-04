import { MNode } from "src/app/jscaip/MNode";
import { LegalityStatus } from "src/app/jscaip/LegalityStatus";
import { DvonnPartSlice } from "../DvonnPartSlice";
import { DvonnMove } from "../dvonnmove/DvonnMove";
import { Rules } from "src/app/jscaip/Rules";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { Coord } from "src/app/jscaip/coord/Coord";
import { ArrayUtils } from "src/app/collectionlib/arrayutils/ArrayUtils";
import { DvonnBoard } from "../DvonnBoard";
import { Player } from "src/app/jscaip/Player";
import { DvonnPieceStack } from "../DvonnPieceStack";
import { MGPValidation } from "src/app/collectionlib/mgpvalidation/MGPValidation";

abstract class DvonnNode extends MNode<DvonnRules, DvonnMove, DvonnPartSlice, LegalityStatus> { }

export class DvonnRules extends Rules<DvonnMove, DvonnPartSlice, LegalityStatus> {
    constructor(initialSlice: DvonnPartSlice) {
        super();
        this.node = MNode.getFirstNode(initialSlice, this);
        this
    }
    private getFreePieces(slice: DvonnPartSlice): Coord[] {
        // Free pieces are the ones that have less than 6 neighbors (and belong to the current player)
        return DvonnBoard.getAllPieces(slice.board)
            .filter((c: Coord): boolean =>
                DvonnBoard.getStackAt(slice.board, c).belongsTo(slice.getCurrentPlayer()) &&
                DvonnBoard.numberOfNeighbors(slice.board, c) < 6);
    }
    private pieceTargets(slice: DvonnPartSlice, coord: Coord): Coord[] {
        const stackSize: number = DvonnBoard.getStackAt(slice.board, coord).size();
        const possibleTargets = DvonnBoard.neighbors(coord, stackSize);
        return possibleTargets.filter((c: Coord): boolean =>
            DvonnBoard.isOnBoard(c) && !DvonnBoard.getStackAt(slice.board, c).isEmpty())
    }
    private pieceHasTarget(slice: DvonnPartSlice, coord: Coord): boolean {
        // A piece has a target if it can move to an occupied space at a distance equal to its length
        const stackSize: number = DvonnBoard.getStackAt(slice.board, coord).size();
        const possibleTargets = DvonnBoard.neighbors(coord, stackSize);
        return possibleTargets.find((c: Coord): boolean =>
            DvonnBoard.isOnBoard(c) && !DvonnBoard.getStackAt(slice.board, c).isEmpty()) !== undefined;
    }
    public getMovablePieces(slice: DvonnPartSlice): Coord[] {
        // Movable pieces are the one that are free
        // and which can move to target (an occupied space at a distance equal to their length)
        return this.getFreePieces(slice).
            filter((c: Coord): boolean => this.pieceHasTarget(slice, c));
    }
    public isMovablePiece(slice: DvonnPartSlice, coord: Coord): MGPValidation {
        if (!DvonnBoard.isOnBoard(coord)) {
            return MGPValidation.failure("Cannot choose a piece outside of the board");
        }
        if (!DvonnBoard.getStackAt(slice.board, coord).belongsTo(slice.getCurrentPlayer())) {
            return MGPValidation.failure("Cannot choose a piece that does not belong to the current player");
        }
        const stackSize: number = DvonnBoard.getStackAt(slice.board, coord).size();
        if (stackSize < 1) {
            return MGPValidation.failure("Stack can't move because it is empty");
        }
        if (DvonnBoard.numberOfNeighbors(slice.board, coord) >= 6) {
            return MGPValidation.failure("Stack can't move because it has 6 or more neighbors");
        }
        if (!this.pieceHasTarget(slice, coord)) {
            return MGPValidation.failure("Stack can't move because it cannot end on a valid target");
        }
        return MGPValidation.success();
    }
    public canOnlyPass(slice: DvonnPartSlice): boolean {
        return this.getMovablePieces(slice).length === 0;
    }
    public getListMovesFromSlice(move: DvonnMove, slice: DvonnPartSlice): MGPMap<DvonnMove, DvonnPartSlice> {
        const map: MGPMap<DvonnMove, DvonnPartSlice> = new MGPMap();
        // For each movable piece, look at its possible targets
        this.getMovablePieces(slice).forEach(start =>
            this.pieceTargets(slice, start).forEach(end => {
                const move = DvonnMove.of(start, end);
                const legalityStatus = this.isLegal(move, slice); // the move should be legal by construction, hence we don't check it
                map.set(move, this.applyLegalMove(move, slice, legalityStatus).resultingSlice);
            }));
        if (map.size() === 0 && move !== DvonnMove.PASS) {
            map.set(DvonnMove.PASS, this.applyLegalMove(DvonnMove.PASS, slice, {legal: MGPValidation.success()}).resultingSlice);
        }
        return map;
    }
    public getListMoves(node: DvonnNode): MGPMap<DvonnMove, DvonnPartSlice> {
        return this.getListMovesFromSlice(node.move, node.gamePartSlice);
    }
    public getBoardValue(move: DvonnMove, slice: DvonnPartSlice): number {
        // Board values is the total number of pieces controlled by player 0 - by player 1
        let p0_score = 0;
        let p1_score = 0;
        DvonnBoard.getAllPieces(slice.board).map((c: Coord) => {
            const stack = DvonnBoard.getStackAt(slice.board, c);
            if (stack.belongsTo(Player.ZERO)) {
                p0_score += stack.size();
            } else if (stack.belongsTo(Player.ONE)){
                p1_score += stack.size();
            }
        });
        if (this.getMovablePieces(slice).length === 0) {
            // This is the end of the game, boost the score to clearly indicate it
            if (p0_score > p1_score) {
                return Number.MIN_SAFE_INTEGER;
            } else if (p0_score < p1_score) {
                return Number.MAX_SAFE_INTEGER;
            } else {
                return 0;
            }
        } else {
            return p0_score - p1_score;
        }
    }
    private sourceCoords(slice: DvonnPartSlice): Coord[] {
        return DvonnBoard.getAllPieces(slice.board)
            .filter((c: Coord): boolean =>
                DvonnBoard.getStackAt(slice.board, c).containsSource());
    }
    private markPiecesConnectedTo(slice: DvonnPartSlice, coord: Coord, markBoard: boolean[][]) {
        // For each neighbor, mark it as connected (if it contains something), and recurse from there (only if it was not already marked)
        DvonnBoard.neighbors(coord, 1).forEach((c: Coord) => {
            if (DvonnBoard.isOnBoard(c) && !markBoard[c.y][c.x] && !DvonnBoard.getStackAt(slice.board, c).isEmpty()) {
                // This piece has not been marked as connected, but it is connected, and not empty
                markBoard[c.y][c.x] = true; // mark it as connected
                this.markPiecesConnectedTo(slice, c, markBoard); // find all pieces connected to this one
            }
        });
    }
    private removeDisconnectedPieces(slice: DvonnPartSlice): DvonnPartSlice {
        // This will contain true for each piece connected to a source
        const markBoard: boolean[][] = ArrayUtils.mapBiArray(DvonnBoard.getBalancedBoard(), _ => false);
        this.sourceCoords(slice).forEach((c: Coord) => {
            markBoard[c.y][c.x] = true; // marks the source as true in the markBoard
            this.markPiecesConnectedTo(slice, c, markBoard);
        });
        const newBoard = ArrayUtils.copyBiArray(slice.board);
        DvonnBoard.getAllPieces(slice.board).forEach((c: Coord) => {
            if (!markBoard[c.y][c.x]) {
                newBoard[c.y][c.x] = DvonnPieceStack.EMPTY.getValue();
            }
        })
        return new DvonnPartSlice(slice.turn, slice.alreadyPassed, newBoard);
    }
    public applyLegalMove(move: DvonnMove, slice: DvonnPartSlice, status: LegalityStatus)
    : { resultingMove: DvonnMove, resultingSlice: DvonnPartSlice } {
        if (move === DvonnMove.PASS) {
            return { resultingSlice: new DvonnPartSlice(slice.turn+1, true, ArrayUtils.copyBiArray(slice.board)), resultingMove: move }
        } else {
            // To apply a legal move, the stack is added in the front of its end coordinate (and removed from its start coordinate)
            const stack = DvonnBoard.getStackAt(slice.board, move.coord);
            const targetStack = DvonnBoard.getStackAt(slice.board, move.end);
            const newBoard = ArrayUtils.copyBiArray(slice.board);
            newBoard[move.coord.y][move.coord.x] = DvonnPieceStack.EMPTY.getValue();
            newBoard[move.end.y][move.end.x] = DvonnPieceStack.append(stack, targetStack).getValue();
            const resultingSlice: DvonnPartSlice = this.removeDisconnectedPieces(new DvonnPartSlice(slice.turn+1, false, newBoard));
            return { resultingSlice, resultingMove: move };
        }
    }
    public isLegal(move: DvonnMove, slice: DvonnPartSlice): LegalityStatus {
        // TODO: some conditions are shared with isMovablePiece, use that here
        if (this.getMovablePieces(slice).length === 0) {
            // If no pieces are movable, the player can pass
            // but only if the previous move was not a pass itself
            if (move === DvonnMove.PASS && !slice.alreadyPassed) {
                return { legal: MGPValidation.success() };
            } else {
                return { legal: MGPValidation.failure("can only pass") };
            }
        }
        // A move is legal if:
        // - the start and end coordinates are on the board
        if (!DvonnBoard.isOnBoard(move.coord) || !DvonnBoard.isOnBoard(move.end)) {
            return { legal: MGPValidation.failure("move not on board ") };
        }
        // - there are less than 6 neighbors
        if (DvonnBoard.numberOfNeighbors(slice.board, move.coord) === 6) {
            return { legal: MGPValidation.failure("too many neighbors at start position") };
        }
        const stack = DvonnBoard.getStackAt(slice.board, move.coord);
        // - the stack that moves is owned by the player
        if (!stack.belongsTo(slice.getCurrentPlayer())) {
            return { legal: MGPValidation.failure("stack does not belong to current player") };
        }
        // - the stack moves in a direction allowed (ensured by DvonnMove)
        // - the stack moves by its size
        if (move.length() !== stack.size()) {
            return { legal: MGPValidation.failure("move length is not the same as stack size") }
        }
        // - the stack ends up on an non-empty stack
        const targetStack = DvonnBoard.getStackAt(slice.board, move.end);
        if (targetStack.isEmpty()) {
            return { legal: MGPValidation.failure("move finishes on an empty stack") };
        }
        return { legal: MGPValidation.success() };
    }
    public setInitialBoard(): void {
        if (this.node == null) {
            this.node = MNode.getFirstNode(DvonnPartSlice.getStartingSlice(), this);
        } else {
            this.node = this.node.getInitialNode();
        }
    }
}
