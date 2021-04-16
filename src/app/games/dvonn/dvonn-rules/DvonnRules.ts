import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { DvonnPartSlice } from '../DvonnPartSlice';
import { DvonnPieceStack } from '../dvonn-piece-stack/DvonnPieceStack';
import { DvonnMove } from '../dvonn-move/DvonnMove';
import { Rules } from 'src/app/jscaip/Rules';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { ArrayUtils } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { DvonnBoard } from '../DvonnBoard';
import { Player } from 'src/app/jscaip/player/Player';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';

abstract class DvonnNode extends MGPNode<DvonnRules, DvonnMove, DvonnPartSlice, LegalityStatus> { }

export class DvonnRules extends Rules<DvonnMove, DvonnPartSlice, LegalityStatus> {
    private getFreePieces(slice: DvonnPartSlice): Coord[] {
        // Free pieces are the ones that have less than 6 neighbors (and belong to the current player)
        return slice.hexaBoard.getAllPieces()
            .filter((c: Coord): boolean =>
                slice.hexaBoard.getAt(c).belongsTo(slice.getCurrentPlayer()) &&
                slice.hexaBoard.numberOfNeighbors(c) < 6);
    }
    private pieceTargets(slice: DvonnPartSlice, coord: Coord): Coord[] {
        const stackSize: number = slice.hexaBoard.getAt(coord).getSize();
        const possibleTargets: Coord[] = DvonnBoard.neighbors(coord, stackSize);
        return possibleTargets.filter((c: Coord): boolean =>
            slice.hexaBoard.isOnBoard(c) && slice.hexaBoard.getAt(c).isEmpty() === false);
    }
    private pieceHasTarget(slice: DvonnPartSlice, coord: Coord): boolean {
        // A piece has a target if it can move to an occupied space at a distance equal to its length
        const stackSize: number = slice.hexaBoard.getAt(coord).getSize();
        const possibleTargets: Coord[] = DvonnBoard.neighbors(coord, stackSize);
        return possibleTargets.find((c: Coord): boolean =>
            slice.hexaBoard.isOnBoard(c) && !slice.hexaBoard.getAt(c).isEmpty()) !== undefined;
    }
    public getMovablePieces(slice: DvonnPartSlice): Coord[] {
        // Movable pieces are the one that are free
        // and which can move to target (an occupied space at a distance equal to their length)
        return this.getFreePieces(slice).
            filter((c: Coord): boolean => this.pieceHasTarget(slice, c));
    }
    public isMovablePiece(slice: DvonnPartSlice, coord: Coord): MGPValidation {
        if (!slice.hexaBoard.isOnBoard(coord)) {
            return MGPValidation.failure('Cannot choose a piece outside of the board');
        }
        if (!slice.hexaBoard.getAt(coord).belongsTo(slice.getCurrentPlayer())) {
            return MGPValidation.failure('Cannot choose a piece that does not belong to the current player');
        }
        const stackSize: number = slice.hexaBoard.getAt(coord).getSize();
        if (stackSize < 1) {
            return MGPValidation.failure('Stack can\'t move because it is empty');
        }
        if (slice.hexaBoard.numberOfNeighbors(coord) >= 6) {
            return MGPValidation.failure('Stack can\'t move because it has 6 or more neighbors');
        }
        if (!this.pieceHasTarget(slice, coord)) {
            return MGPValidation.failure('Stack can\'t move because it cannot end on a valid target');
        }
        return MGPValidation.SUCCESS;
    }
    public canOnlyPass(slice: DvonnPartSlice): boolean {
        return this.getMovablePieces(slice).length === 0;
    }
    public getListMovesFromSlice(move: DvonnMove, slice: DvonnPartSlice): MGPMap<DvonnMove, DvonnPartSlice> {
        const map: MGPMap<DvonnMove, DvonnPartSlice> = new MGPMap();
        // For each movable piece, look at its possible targets
        this.getMovablePieces(slice).forEach((start: Coord) =>
            this.pieceTargets(slice, start).forEach((end: Coord) => {
                const move: DvonnMove = DvonnMove.of(start, end);
                const legalityStatus: LegalityStatus = this.isLegal(move, slice);
                // the move should be legal by construction, hence we don't check it
                map.set(move, this.applyLegalMove(move, slice, legalityStatus).resultingSlice);
            }));
        if (map.size() === 0 && move !== DvonnMove.PASS) {
            map.set(DvonnMove.PASS, this.applyLegalMove(DvonnMove.PASS, slice,
                                                        { legal: MGPValidation.SUCCESS }).resultingSlice);
        }
        return map;
    }
    public getListMoves(node: DvonnNode): MGPMap<DvonnMove, DvonnPartSlice> {
        return this.getListMovesFromSlice(node.move, node.gamePartSlice);
    }
    public getScores(slice: DvonnPartSlice): number[] {
        // Board value is the total number of pieces controlled by player 0 - by player 1
        let p0Score: number = 0;
        let p1Score: number = 0;
        slice.hexaBoard.getAllPieces().map((c: Coord) => {
            const stack: DvonnPieceStack = slice.hexaBoard.getAt(c);
            if (stack.belongsTo(Player.ZERO)) {
                p0Score += stack.getSize();
            } else if (stack.belongsTo(Player.ONE)) {
                p1Score += stack.getSize();
            }
        });
        return [p0Score, p1Score];
    }
    public getBoardValue(move: DvonnMove, slice: DvonnPartSlice): number {
        // Board value is the total number of pieces controlled by player 0 - by player 1
        const scores: number[] = this.getScores(slice);
        if (this.getMovablePieces(slice).length === 0) {
            // This is the end of the game, boost the score to clearly indicate it
            if (scores[0] > scores[1]) {
                return Number.MIN_SAFE_INTEGER;
            } else if (scores[0] < scores[1]) {
                return Number.MAX_SAFE_INTEGER;
            } else {
                return 0;
            }
        } else {
            return scores[0] - scores[1];
        }
    }
    private sourceCoords(slice: DvonnPartSlice): Coord[] {
        return slice.hexaBoard.getAllPieces()
            .filter((c: Coord): boolean =>
                slice.hexaBoard.getAt(c).containsSource());
    }
    private markPiecesConnectedTo(slice: DvonnPartSlice, coord: Coord, markBoard: boolean[][]) {
        // For each neighbor, mark it as connected (if it contains something),
        // and recurse from there (only if it was not already marked)
        DvonnBoard.neighbors(coord, 1).forEach((c: Coord) => {
            if (slice.hexaBoard.isOnBoard(c) && !markBoard[c.y][c.x] && !slice.hexaBoard.getAt(c).isEmpty()) {
                // This piece has not been marked as connected, but it is connected, and not empty
                markBoard[c.y][c.x] = true; // mark it as connected
                this.markPiecesConnectedTo(slice, c, markBoard); // find all pieces connected to this one
            }
        });
    }
    private removeDisconnectedPieces(slice: DvonnPartSlice): DvonnPartSlice {
        // This will contain true for each piece connected to a source
        const markBoard: boolean[][] = ArrayUtils.createBiArray(DvonnBoard.WIDTH, DvonnBoard.HEIGHT, false);
        this.sourceCoords(slice).forEach((c: Coord) => {
            markBoard[c.y][c.x] = true; // marks the source as true in the markBoard
            this.markPiecesConnectedTo(slice, c, markBoard);
        });
        let newBoard: DvonnBoard = slice.hexaBoard;
        slice.hexaBoard.getAllPieces().forEach((c: Coord) => {
            if (!markBoard[c.y][c.x]) {
                newBoard = newBoard.setAt(c, DvonnPieceStack.EMPTY);
            }
        });
        return new DvonnPartSlice(newBoard, slice.turn, slice.alreadyPassed);
    }
    public applyLegalMove(move: DvonnMove, slice: DvonnPartSlice, status: LegalityStatus)
    : { resultingMove: DvonnMove, resultingSlice: DvonnPartSlice } {
        if (move === DvonnMove.PASS) {
            return {
                resultingSlice: new DvonnPartSlice(slice.hexaBoard, slice.turn + 1, true),
                resultingMove: move,
            };
        } else {
            // To apply a legal move, the stack is added in the front of its end coordinate
            // (and removed from its start coordinate)
            const stack: DvonnPieceStack = slice.hexaBoard.getAt(move.coord);
            const targetStack: DvonnPieceStack = slice.hexaBoard.getAt(move.end);
            const newBoard: DvonnBoard = slice.hexaBoard
                .setAt(move.coord, DvonnPieceStack.EMPTY)
                .setAt(move.end, DvonnPieceStack.append(stack, targetStack));
            const resultingSlice: DvonnPartSlice =
                this.removeDisconnectedPieces(new DvonnPartSlice(newBoard, slice.turn+1, false));
            return { resultingSlice, resultingMove: move };
        }
    }
    public isLegal(move: DvonnMove, slice: DvonnPartSlice): LegalityStatus {
        // TODO: some conditions are shared with isMovablePiece, use that here
        if (this.getMovablePieces(slice).length === 0) {
            // If no pieces are movable, the player can pass
            // but only if the previous move was not a pass itself
            if (move === DvonnMove.PASS && !slice.alreadyPassed) {
                return { legal: MGPValidation.SUCCESS };
            } else {
                return { legal: MGPValidation.failure('can only pass') };
            }
        }
        // A move is legal if:
        // - the start and end coordinates are on the board
        if (!slice.hexaBoard.isOnBoard(move.coord) || !slice.hexaBoard.isOnBoard(move.end)) {
            return { legal: MGPValidation.failure('move not on board ') };
        }
        // - there are less than 6 neighbors
        if (slice.hexaBoard.numberOfNeighbors(move.coord) === 6) {
            return { legal: MGPValidation.failure('too many neighbors at start position') };
        }
        const stack: DvonnPieceStack = slice.hexaBoard.getAt(move.coord);
        // - the stack that moves is owned by the player
        if (!stack.belongsTo(slice.getCurrentPlayer())) {
            return { legal: MGPValidation.failure('stack does not belong to current player') };
        }
        // - the stack moves in a direction allowed (ensured by DvonnMove)
        // - the stack moves by its size
        if (move.length() !== stack.getSize()) {
            return { legal: MGPValidation.failure('move length is not the same as stack size') };
        }
        // - the stack ends up on an non-empty stack
        const targetStack: DvonnPieceStack = slice.hexaBoard.getAt(move.end);
        if (targetStack.isEmpty()) {
            return { legal: MGPValidation.failure('move finishes on an empty stack') };
        }
        return { legal: MGPValidation.SUCCESS };
    }
}
