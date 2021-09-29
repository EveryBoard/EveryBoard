import { MGPNode } from 'src/app/jscaip/MGPNode';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { DvonnState } from './DvonnState';
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
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

export abstract class DvonnNode extends MGPNode<DvonnRules, DvonnMove, DvonnState> { }

export class DvonnRules extends Rules<DvonnMove, DvonnState> {

    public static getGameStatus(node: DvonnNode): GameStatus {
        const state: DvonnState = node.gameState;
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
    public static getMovablePieces(state: DvonnState): Coord[] {
        // Movable pieces are the one that are free
        // and which can move to target (an occupied space at a distance equal to their length)
        return DvonnRules.getFreePieces(state)
            .filter((c: Coord): boolean => DvonnRules.pieceHasTarget(state, c));
    }
    private static getFreePieces(state: DvonnState): Coord[] {
        // Free pieces are the ones that have less than 6 neighbors (and belong to the current player)
        return state.board.getAllPieces()
            .filter((c: Coord): boolean =>
                state.board.getAt(c).belongsTo(state.getCurrentPlayer()) &&
                state.board.numberOfNeighbors(c) < 6);
    }
    private static pieceHasTarget(state: DvonnState, coord: Coord): boolean {
        // A piece has a target if it can move to an occupied space at a distance equal to its length
        const stackSize: number = state.board.getAt(coord).getSize();
        const possibleTargets: Coord[] = HexaBoard.neighbors(coord, stackSize);
        return possibleTargets.find((c: Coord): boolean =>
            state.board.isOnBoard(c) && !state.board.getAt(c).isEmpty()) !== undefined;
    }
    public static pieceTargets(state: DvonnState, coord: Coord): Coord[] {
        const stackSize: number = state.board.getAt(coord).getSize();
        const possibleTargets: Coord[] = HexaBoard.neighbors(coord, stackSize);
        return possibleTargets.filter((c: Coord): boolean =>
            state.board.isOnBoard(c) && state.board.getAt(c).isEmpty() === false);
    }
    public static getScores(state: DvonnState): number[] {
        // Board value is the total number of pieces controlled by player 0 - by player 1
        let p0Score: number = 0;
        let p1Score: number = 0;
        state.board.getAllPieces().map((c: Coord) => {
            const stack: DvonnPieceStack = state.board.getAt(c);
            if (stack.belongsTo(Player.ZERO)) {
                p0Score += stack.getSize();
            } else if (stack.belongsTo(Player.ONE)) {
                p1Score += stack.getSize();
            }
        });
        return [p0Score, p1Score];
    }
    public isMovablePiece(state: DvonnState, coord: Coord): MGPValidation {
        if (!state.board.isOnBoard(coord)) {
            return MGPValidation.failure(DvonnFailure.INVALID_COORD);
        }
        const stack: DvonnPieceStack = state.board.getAt(coord);
        if (stack.getSize() < 1) {
            return MGPValidation.failure(DvonnFailure.EMPTY_STACK);
        }
        if (!stack.belongsTo(state.getCurrentPlayer())) {
            return MGPValidation.failure(DvonnFailure.NOT_PLAYER_PIECE);
        }
        if (state.board.numberOfNeighbors(coord) >= 6) {
            return MGPValidation.failure(DvonnFailure.TOO_MANY_NEIGHBORS);
        }
        if (!DvonnRules.pieceHasTarget(state, coord)) {
            return MGPValidation.failure(DvonnFailure.CANT_REACH_TARGET);
        }
        return MGPValidation.SUCCESS;
    }
    public canOnlyPass(state: DvonnState): boolean {
        return DvonnRules.getMovablePieces(state).length === 0;
    }
    private sourceCoords(state: DvonnState): Coord[] {
        return state.board.getAllPieces()
            .filter((c: Coord): boolean =>
                state.board.getAt(c).containsSource());
    }
    private markPiecesConnectedTo(state: DvonnState, coord: Coord, markBoard: boolean[][]) {
        // For each neighbor, mark it as connected (if it contains something),
        // and recurse from there (only if it was not already marked)
        HexaBoard.neighbors(coord, 1).forEach((c: Coord) => {
            if (state.board.isOnBoard(c) && !markBoard[c.y][c.x] && !state.board.getAt(c).isEmpty()) {
                // This piece has not been marked as connected, but it is connected, and not empty
                markBoard[c.y][c.x] = true; // mark it as connected
                this.markPiecesConnectedTo(state, c, markBoard); // find all pieces connected to this one
            }
        });
    }
    private removeDisconnectedPieces(state: DvonnState): DvonnState {
        // This will contain true for each piece connected to a source
        const markBoard: boolean[][] = ArrayUtils.createBiArray(DvonnBoard.WIDTH, DvonnBoard.HEIGHT, false);
        this.sourceCoords(state).forEach((c: Coord) => {
            markBoard[c.y][c.x] = true; // marks the source as true in the markBoard
            this.markPiecesConnectedTo(state, c, markBoard);
        });
        let newBoard: DvonnBoard = state.board;
        state.board.getAllPieces().forEach((c: Coord) => {
            if (!markBoard[c.y][c.x]) {
                newBoard = newBoard.setAt(c, DvonnPieceStack.EMPTY);
            }
        });
        return new DvonnState(newBoard, state.turn, state.alreadyPassed);
    }
    public applyLegalMove(move: DvonnMove,
                          state: DvonnState,
                          status: LegalityStatus)
    : DvonnState
    {
        if (move === DvonnMove.PASS) {
            return new DvonnState(state.board, state.turn + 1, true);
        } else {
            // To apply a legal move, the stack is added in the front of its end coordinate
            // (and removed from its start coordinate)
            const stack: DvonnPieceStack = state.board.getAt(move.coord);
            const targetStack: DvonnPieceStack = state.board.getAt(move.end);
            const newBoard: DvonnBoard = state.board
                .setAt(move.coord, DvonnPieceStack.EMPTY)
                .setAt(move.end, DvonnPieceStack.append(stack, targetStack));
            const resultingState: DvonnState =
                this.removeDisconnectedPieces(new DvonnState(newBoard, state.turn+1, false));
            return resultingState;
        }
    }
    public isLegal(move: DvonnMove, state: DvonnState): LegalityStatus {
        if (DvonnRules.getMovablePieces(state).length === 0) {
            // If no pieces are movable, the player can pass
            // but only if the previous move was not a pass itself
            if (move === DvonnMove.PASS && !state.alreadyPassed) {
                return { legal: MGPValidation.SUCCESS };
            } else {
                return { legal: MGPValidation.failure(RulesFailure.MUST_PASS) };
            }
        }

        const pieceMovable: MGPValidation = this.isMovablePiece(state, move.coord);
        if (pieceMovable.isFailure()) {
            return { legal: pieceMovable };
        }

        const stack: DvonnPieceStack = state.board.getAt(move.coord);
        if (move.length() !== stack.getSize()) {
            return { legal: MGPValidation.failure(DvonnFailure.INVALID_MOVE_LENGTH) };
        }

        const targetStack: DvonnPieceStack = state.board.getAt(move.end);
        if (targetStack.isEmpty()) {
            return { legal: MGPValidation.failure(DvonnFailure.EMPTY_TARGET_STACK) };
        }
        return { legal: MGPValidation.SUCCESS };
    }
    public getGameStatus(node: DvonnNode): GameStatus {
        return DvonnRules.getGameStatus(node);
    }
}
