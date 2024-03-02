import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Rules } from 'src/app/jscaip/Rules';
import { DraughtMove } from './DraughtMove';
import { DraughtPiece, DraughtState } from './DraughtState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { GameNode } from '../../jscaip/AI/GameNode';
import { ArrayUtils, Table } from '../../utils/ArrayUtils';
import { Player, PlayerOrNone } from '../../jscaip/Player';
import { Coord } from '../../jscaip/Coord';
import { MGPValidation } from '../../utils/MGPValidation';
import { RulesFailure } from '../../jscaip/RulesFailure';
import { DraughtFailure } from './DraughtFailure';
import { Vector } from '../../jscaip/Vector';
import { Direction } from '../../jscaip/Direction';
import { Utils } from '../../utils/utils';

/**
 * This class is optional.
 * If you don't use it, you can remove it everywhere it is mentionned.
 *
 * It provides extra information that is returned by the `isLegal` method of the rules.
 * This information is then provided to the `applyLegalMove` method of the rules.
 * That way, we can avoid duplicating some computations already made in `isLegal`.
 * By default, `void` is used if you don't provide one.
 * There are no restrictions to this definition.
 */
export class DraughtLegalityInfo {
}

/**
 * This class is optional and rarely used.
 * If you don't use it, you can remove it everywhere it is mentioned, including in types.
 *
 * The `BoardValue` denotes the value of a state, for the sake of IA computations.
 * In most cases, the default `BoardValue`, a number wrapper, is enough.
 */
export class DraughtBoardValue extends BoardValue {
}

/**
 * Defining the game node class is only for cosmetic purposes. It reduces the length of the argument to `getGameStatus`.
 */
export class DraughtNode extends GameNode<DraughtMove, DraughtState> {}

/**
 * This is where you define the rules of the game.
 * It should be a singleton class.
 * It is used by the wrappers to check the legality of a move, and to apply the move on a state.
 */
export class DraughtRules extends Rules<DraughtMove, DraughtState> {

    /**
     * This is the singleton instance. You should keep this as is, except for adapting the class name.
     */
    private static singleton: MGPOptional<DraughtRules> = MGPOptional.empty();

    /**
     * This gets the singleton instance. Similarly, keep this as is.
     */
    public static get(): DraughtRules {
        if (DraughtRules.singleton.isAbsent()) {
            DraughtRules.singleton = MGPOptional.of(new DraughtRules());
        }
        return DraughtRules.singleton.get();
    }

    public isStep(piece: DraughtPiece, firstCoord: Coord, secondCoord: Coord, state: DraughtState): boolean {
        if (piece.isQueen()) {
            const coords: Coord[] = firstCoord.getCoordsToward(secondCoord);
            for (const coord: Coord of coords) {
                if (state.getPieceAt(coord).isEmpty() === false) {
                    return false;
                }
            }
            return true;
        }
        else {
            const vector: Vector = firstCoord.getVectorToward(secondCoord);
            if (Math.abs(vector.x) === 1 && Math.abs(vector.y) === 1) {
                return true;
            }
        }
    }

    public override getInitialState(): DraughtState {
        const O: DraughtPiece = new DraughtPiece(PlayerOrNone.ZERO, false);
        const X: DraughtPiece = new DraughtPiece(PlayerOrNone.ONE, false);
        const _: DraughtPiece = new DraughtPiece(PlayerOrNone.NONE, false);
        const board: Table<DraughtPiece> = [
            [_, X, _, X, _, X, _, X, _, X],
            [X, _, X, _, X, _, X, _, X, _],
            [_, X, _, X, _, X, _, X, _, X],
            [X, _, X, _, X, _, X, _, X, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, O, _, O, _, O, _, O, _, O],
            [O, _, O, _, O, _, O, _, O, _],
            [_, O, _, O, _, O, _, O, _, O],
            [O, _, O, _, O, _, O, _, O, _],
        ];
        return new DraughtState(board, 0);
    }

    /**
     * This method checks whether it is legal to apply a move to a state.
     * @param move the move
     * @param state the state on which to check the move legality
     * @returns a MGPFallible of the GameLegalityInfo, being a success if the move is legal,
     *   a failure containing the reason for the illegality of the move.
     */
    public isLegal(move: DraughtMove, state: DraughtState): MGPValidation {

        const moveStart: Coord = move.getStartingCoord();
        if (state.getPieceAt(moveStart).isEmpty()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }

        const movedPiece: DraughtPiece = state.getPieceAt(moveStart);
        const opponent: Player = state.getCurrentOpponent();
        if (movedPiece.isOwnedBy(opponent)) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }

        const secondCoord: Coord = move.coords[1];
        if (movedPiece.isQueen() === false) {
            const moveDirection: number = moveStart.getDirectionToward(secondCoord).get().y;
            if (moveDirection === opponent.getScoreModifier()) {
                return MGPValidation.failure(DraughtFailure.CANNOT_GO_BACKWARD());
            }
        }
        if (state.getPieceAt(secondCoord).isEmpty() === false) {
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        const possibleCapture: DraughtMove[] = this.getCaptures(state);
        if (this.isStep(movedPiece, moveStart, secondCoord, state)) {

        }
    }

    public getCaptures(state: DraughtState): DraughtMove[] {
        const player: Player = state.getCurrentPlayer();
        return this.getCapturesOf(state, player);
    }

    public getCapturesOf(state: DraughtState, player: Player): DraughtMove[] {
        const playerPieces: Coord[] = state.getPieceOf(player);
        let allCapture: DraughtMove[] = [];
        for (const playerPiece of playerPieces) {
            allCapture.push(...this.getPieceCaptures(state, playerPiece));
        }
        return ArrayUtils.maximumsBy<DraughtMove>(allCapture, (move: DraughtMove) => move.coords.length);
    }

    public getPieceCaptures(state: DraughtState, coord: Coord): DraughtMove[] {
        let pieceMoves: DraughtMove[] = [];
        const piece: DraughtPiece = state.getPieceAt(coord);
        Utils.assert(piece.getOwner().isPlayer(), 'Should be a piece owned by a player and not an empty space');
        const pieceOwner: Player = piece.getOwner() as Player;
        const opponent: Player = pieceOwner.getOpponent();

        const directions: Direction[] = this.getPieceDirections(state, coord);
        const moved: DraughtPiece = state.getPieceAt(coord);
        for (const direction of directions) {
            const captured: Coord = coord.getNext(direction, 1);
            if (DraughtState.isOnBoard(captured) && state.getPieceAt(captured).isOwnedBy(opponent)) {
                const landing: Coord = captured.getNext(direction, 1);
                if (DraughtState.isOnBoard(landing) && state.getPieceAt(landing).isEmpty()) {
                    const fakePostCaptureState: DraughtState = state.remove(coord).remove(captured).set(landing, moved);
                    // Not needed to do the real capture
                    const startOfMove: DraughtMove = DraughtMove.fromCapture([coord, landing]).get();
                    const endsOfMoves: DraughtMove[] = this.getPieceCaptures(fakePostCaptureState, landing);
                    if (endsOfMoves.length === 0) {
                        pieceMoves = pieceMoves.concat(startOfMove);
                    } else {
                        const mergedMoves: DraughtMove[] = endsOfMoves.map((m: DraughtMove) => startOfMove.concatenate(m));
                        pieceMoves = pieceMoves.concat(mergedMoves);
                    }
                }
            }
        }
        return pieceMoves;
    }

    private getPieceDirections(state: DraughtState, coord: Coord): Direction[] {
        const piece: DraughtPiece = state.getPieceAt(coord);
        Utils.assert(piece.getOwner().isPlayer(), 'Should be a piece owned by a player and not an empty space');
        const pieceOwner: Player = piece.getOwner() as Player;
        // Since player zero must go up (-1) and player one go down (+1)
        // Then we can use the score modifier that happens to match to the "vertical direction" of each player
        const verticalDirection: number = pieceOwner.getScoreModifier();
        const directions: Direction[] = [
            Direction.factory.fromDelta(-1, verticalDirection).get(),
            Direction.factory.fromDelta(1, verticalDirection).get(),
        ];
        if (state.getPieceAt(coord).isQueen) {
            directions.push(Direction.factory.fromDelta(-1, - verticalDirection).get(),
                Direction.factory.fromDelta(1, - verticalDirection).get());
        }
        return directions;
    }

    /**
     * This is the methods that applies the move to a state.
     * We know the move is legal because it has been checked with `isLegal`.
     * @param move the move to apply to the state
     * @param state the state on which to apply the move
     * @param info the info that had been returned by `isLegal`
     * @returns the resulting state, i.e., the state on which move has been applied
     */

    public applyLegalMove(move: DraughtMove, state: DraughtState, info: DraughtLegalityInfo): DraughtState {
        return new DraughtState(state.turn + 1);
    }
    /**
     * This method checks whether the game is in progress or finished.
     * @param node the node for which we check the game status
     * @returns a GameStatus (ZERO_WON, ONE_WON, DRAW, ONGOING)
     */
    public getGameStatus(node: DraughtNode): GameStatus {
        if (node.gameState.turn < 42) {
            return GameStatus.ONGOING;
        } else {
            return GameStatus.DRAW;
        }
    }
}
