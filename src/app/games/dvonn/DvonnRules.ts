import { MGPNode } from 'src/app/jscaip/MGPNode';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { DvonnPartSlice } from './DvonnPartSlice';
import { DvonnPieceStack } from './DvonnPieceStack';
import { DvonnMove } from './DvonnMove';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { Coord } from 'src/app/jscaip/Coord';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { DvonnBoard } from './DvonnBoard';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { HexaBoard } from 'src/app/jscaip/HexaBoard';
import { DvonnFailure } from './DvonnFailure';

export abstract class DvonnNode extends MGPNode<DvonnRules, DvonnMove, DvonnPartSlice> { }

export class DvonnRules extends Rules<DvonnMove, DvonnPartSlice> {

    public static getMovablePieces(slice: DvonnPartSlice): Coord[] {
        // Movable pieces are the one that are free
        // and which can move to target (an occupied space at a distance equal to their length)
        return DvonnRules.getFreePieces(slice)
            .filter((c: Coord): boolean => DvonnRules.pieceHasTarget(slice, c));
    }
    private static getFreePieces(slice: DvonnPartSlice): Coord[] {
        // Free pieces are the ones that have less than 6 neighbors (and belong to the current player)
        return slice.hexaBoard.getAllPieces()
            .filter((c: Coord): boolean =>
                slice.hexaBoard.getAt(c).belongsTo(slice.getCurrentPlayer()) &&
                slice.hexaBoard.numberOfNeighbors(c) < 6);
    }
    private static pieceHasTarget(slice: DvonnPartSlice, coord: Coord): boolean {
        // A piece has a target if it can move to an occupied space at a distance equal to its length
        const stackSize: number = slice.hexaBoard.getAt(coord).getSize();
        const possibleTargets: Coord[] = HexaBoard.neighbors(coord, stackSize);
        return possibleTargets.find((c: Coord): boolean =>
            slice.hexaBoard.isOnBoard(c) && !slice.hexaBoard.getAt(c).isEmpty()) !== undefined;
    }
    public static pieceTargets(slice: DvonnPartSlice, coord: Coord): Coord[] {
        const stackSize: number = slice.hexaBoard.getAt(coord).getSize();
        const possibleTargets: Coord[] = HexaBoard.neighbors(coord, stackSize);
        return possibleTargets.filter((c: Coord): boolean =>
            slice.hexaBoard.isOnBoard(c) && slice.hexaBoard.getAt(c).isEmpty() === false);
    }
    public static getScores(slice: DvonnPartSlice): number[] {
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
    public isMovablePiece(slice: DvonnPartSlice, coord: Coord): MGPValidation {
        if (!slice.hexaBoard.isOnBoard(coord)) {
            return MGPValidation.failure(DvonnFailure.INVALID_COORD);
        }
        const stack: DvonnPieceStack = slice.hexaBoard.getAt(coord);
        if (stack.getSize() < 1) {
            return MGPValidation.failure(DvonnFailure.EMPTY_STACK);
        }
        if (!stack.belongsTo(slice.getCurrentPlayer())) {
            return MGPValidation.failure(DvonnFailure.NOT_PLAYER_PIECE);
        }
        if (slice.hexaBoard.numberOfNeighbors(coord) >= 6) {
            return MGPValidation.failure(DvonnFailure.TOO_MANY_NEIGHBORS);
        }
        if (!DvonnRules.pieceHasTarget(slice, coord)) {
            return MGPValidation.failure(DvonnFailure.CANT_REACH_TARGET);
        }
        return MGPValidation.SUCCESS;
    }
    public canOnlyPass(slice: DvonnPartSlice): boolean {
        return DvonnRules.getMovablePieces(slice).length === 0;
    }
    private sourceCoords(slice: DvonnPartSlice): Coord[] {
        return slice.hexaBoard.getAllPieces()
            .filter((c: Coord): boolean =>
                slice.hexaBoard.getAt(c).containsSource());
    }
    private markPiecesConnectedTo(slice: DvonnPartSlice, coord: Coord, markBoard: boolean[][]) {
        // For each neighbor, mark it as connected (if it contains something),
        // and recurse from there (only if it was not already marked)
        HexaBoard.neighbors(coord, 1).forEach((c: Coord) => {
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
    public applyLegalMove(move: DvonnMove,
                          slice: DvonnPartSlice,
                          status: LegalityStatus)
    : DvonnPartSlice
    {
        if (move === DvonnMove.PASS) {
            return new DvonnPartSlice(slice.hexaBoard, slice.turn + 1, true);
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
            return resultingSlice;
        }
    }
    public isLegal(move: DvonnMove, slice: DvonnPartSlice): LegalityStatus {
        if (DvonnRules.getMovablePieces(slice).length === 0) {
            // If no pieces are movable, the player can pass
            // but only if the previous move was not a pass itself
            if (move === DvonnMove.PASS && !slice.alreadyPassed) {
                return { legal: MGPValidation.SUCCESS };
            } else {
                return { legal: MGPValidation.failure(DvonnFailure.CAN_ONLY_PASS) };
            }
        }

        const pieceMovable: MGPValidation = this.isMovablePiece(slice, move.coord);
        if (pieceMovable.isFailure()) {
            return { legal: pieceMovable };
        }

        const stack: DvonnPieceStack = slice.hexaBoard.getAt(move.coord);
        if (move.length() !== stack.getSize()) {
            return { legal: MGPValidation.failure(DvonnFailure.INVALID_MOVE_LENGTH) };
        }

        const targetStack: DvonnPieceStack = slice.hexaBoard.getAt(move.end);
        if (targetStack.isEmpty()) {
            return { legal: MGPValidation.failure(DvonnFailure.EMPTY_TARGET_STACK) };
        }
        return { legal: MGPValidation.SUCCESS };
    }
    public getGameStatus(node: DvonnNode): GameStatus {
        const state: DvonnPartSlice = node.gamePartSlice;
        const scores: number[] = DvonnRules.getScores(state);
        if (DvonnRules.getMovablePieces(state).length === 0) {
            // This is the end of the game, boost the score to clearly indicate it
            if (scores[0] > scores[1]) {
                return GameStatus.ZERO_WON;
            } else if (scores[0] < scores[1]) {
                return GameStatus.ONE_WON;
            } else {
                return GameStatus.DRAW;
            }
        } else {
            return GameStatus.ONGOING;
        }
    }
}
