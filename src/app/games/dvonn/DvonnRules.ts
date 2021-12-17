import { MGPNode } from 'src/app/jscaip/MGPNode';
import { DvonnState } from './DvonnState';
import { DvonnPieceStack } from './DvonnPieceStack';
import { DvonnMove } from './DvonnMove';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { Coord } from 'src/app/jscaip/Coord';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { HexagonalGameState } from 'src/app/jscaip/HexagonalGameState';
import { DvonnFailure } from './DvonnFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { assert } from 'src/app/utils/utils';

export class DvonnNode extends MGPNode<DvonnRules, DvonnMove, DvonnState> { }

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
        return state.getAllPieces()
            .filter((c: Coord): boolean =>
                state.getPieceAt(c).belongsTo(state.getCurrentPlayer()) &&
                state.numberOfNeighbors(c) < 6);
    }
    private static pieceHasTarget(state: DvonnState, coord: Coord): boolean {
        // A piece has a target if it can move to an occupied space at a distance equal to its length
        const stackSize: number = state.getPieceAt(coord).getSize();
        const possibleTargets: Coord[] = HexagonalGameState.neighbors(coord, stackSize);
        return possibleTargets.find((c: Coord): boolean =>
            state.isOnBoard(c) && !state.getPieceAt(c).isEmpty()) !== undefined;
    }
    public static pieceTargets(state: DvonnState, coord: Coord): Coord[] {
        const stackSize: number = state.getPieceAt(coord).getSize();
        const possibleTargets: Coord[] = HexagonalGameState.neighbors(coord, stackSize);
        return possibleTargets.filter((c: Coord): boolean =>
            state.isOnBoard(c) && state.getPieceAt(c).isEmpty() === false);
    }
    public static getScores(state: DvonnState): [number, number] {
        // Board value is the total number of pieces controlled by player 0 - by player 1
        let p0Score: number = 0;
        let p1Score: number = 0;
        state.getAllPieces().map((c: Coord) => {
            const stack: DvonnPieceStack = state.getPieceAt(c);
            if (stack.belongsTo(Player.ZERO)) {
                p0Score += stack.getSize();
            } else if (stack.belongsTo(Player.ONE)) {
                p1Score += stack.getSize();
            }
        });
        return [p0Score, p1Score];
    }
    public isMovablePiece(state: DvonnState, coord: Coord): MGPValidation {
        assert(state.isOnBoard(coord), 'piece is not on the board');
        const stack: DvonnPieceStack = state.getPieceAt(coord);
        if (stack.getSize() < 1) {
            return MGPValidation.failure(DvonnFailure.EMPTY_STACK());
        }
        if (!stack.belongsTo(state.getCurrentPlayer())) {
            return MGPValidation.failure(DvonnFailure.NOT_PLAYER_PIECE());
        }
        if (state.numberOfNeighbors(coord) >= 6) {
            return MGPValidation.failure(DvonnFailure.TOO_MANY_NEIGHBORS());
        }
        if (!DvonnRules.pieceHasTarget(state, coord)) {
            return MGPValidation.failure(DvonnFailure.CANT_REACH_TARGET());
        }
        return MGPValidation.SUCCESS;
    }
    public canOnlyPass(state: DvonnState): boolean {
        return DvonnRules.getMovablePieces(state).length === 0;
    }
    private sourceCoords(state: DvonnState): Coord[] {
        return state.getAllPieces()
            .filter((c: Coord): boolean =>
                state.getPieceAt(c).containsSource());
    }
    private markPiecesConnectedTo(state: DvonnState, coord: Coord, markBoard: boolean[][]) {
        // For each neighbor, mark it as connected (if it contains something),
        // and recurse from there (only if it was not already marked)
        HexagonalGameState.neighbors(coord, 1).forEach((c: Coord) => {
            if (state.isOnBoard(c) && !markBoard[c.y][c.x] && !state.getPieceAt(c).isEmpty()) {
                // This piece has not been marked as connected, but it is connected, and not empty
                markBoard[c.y][c.x] = true; // mark it as connected
                this.markPiecesConnectedTo(state, c, markBoard); // find all pieces connected to this one
            }
        });
    }
    private removeDisconnectedPieces(state: DvonnState): DvonnState {
        // This will contain true for each piece connected to a source
        const markBoard: boolean[][] = ArrayUtils.createTable(DvonnState.WIDTH, DvonnState.HEIGHT, false);
        this.sourceCoords(state).forEach((c: Coord) => {
            markBoard[c.y][c.x] = true; // marks the source as true in the markBoard
            this.markPiecesConnectedTo(state, c, markBoard);
        });
        let newState: DvonnState = state;
        newState.getAllPieces().forEach((c: Coord) => {
            if (!markBoard[c.y][c.x]) {
                newState = newState.setAt(c, DvonnPieceStack.EMPTY);
            }
        });
        return newState;
    }
    public applyLegalMove(move: DvonnMove,
                          state: DvonnState,
                          _status: void)
    : DvonnState
    {
        if (move === DvonnMove.PASS) {
            return new DvonnState(state.board, state.turn + 1, true);
        } else {
            // To apply a legal move, the stack is added in the front of its end coordinate
            // (and removed from its start coordinate)
            const stack: DvonnPieceStack = state.getPieceAt(move.coord);
            const targetStack: DvonnPieceStack = state.getPieceAt(move.end);
            const newState: DvonnState = state
                .setAt(move.coord, DvonnPieceStack.EMPTY)
                .setAt(move.end, DvonnPieceStack.append(stack, targetStack));
            const resultingState: DvonnState =
                this.removeDisconnectedPieces(new DvonnState(newState.board, state.turn + 1, false));
            return resultingState;
        }
    }
    public isLegal(move: DvonnMove, state: DvonnState): MGPFallible<void> {
        if (DvonnRules.getMovablePieces(state).length === 0) {
            // If no pieces are movable, the player can pass
            // but only if the previous move was not a pass itself
            if (move === DvonnMove.PASS && !state.alreadyPassed) {
                return MGPFallible.success(undefined);
            } else {
                return MGPFallible.failure(RulesFailure.MUST_PASS());
            }
        } else if (move === DvonnMove.PASS) {
            return MGPFallible.failure(RulesFailure.CANNOT_PASS());
        }

        const pieceMovable: MGPValidation = this.isMovablePiece(state, move.coord);
        if (pieceMovable.isFailure()) {
            return pieceMovable.toFailedFallible();
        }

        const stack: DvonnPieceStack = state.getPieceAt(move.coord);
        if (move.length() !== stack.getSize()) {
            return MGPFallible.failure(DvonnFailure.INVALID_MOVE_LENGTH());
        }

        const targetStack: DvonnPieceStack = state.getPieceAt(move.end);
        if (targetStack.isEmpty()) {
            return MGPFallible.failure(DvonnFailure.EMPTY_TARGET_STACK());
        }
        return MGPFallible.success(undefined);
    }
    public getGameStatus(node: DvonnNode): GameStatus {
        return DvonnRules.getGameStatus(node);
    }
}
