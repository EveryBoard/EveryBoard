import { Coord, CoordFailure } from 'src/app/jscaip/Coord';
import { Ordinal } from 'src/app/jscaip/Ordinal';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { Player } from 'src/app/jscaip/Player';
import { ConfigurableRules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ArrayUtils, MGPFallible, MGPOptional, MGPValidation } from '@everyboard/lib';
import { CheckersMove } from './CheckersMove';
import { CheckersFailure } from './CheckersFailure';
import { CheckersPiece, CheckersStack, CheckersState } from './CheckersState';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { TableUtils } from 'src/app/jscaip/TableUtils';
import { CoordSet } from 'src/app/jscaip/CoordSet';
import { Localized } from 'src/app/utils/LocaleUtils';

export type CheckersConfig = {
    playerRows: number;
    emptyRows: number;
    width: number;
    stackPiece: boolean;
    maximalCapture: boolean;
    simplePieceCanCaptureBackwards: boolean;
    promotedPiecesCanTravelLongDistances: boolean;
    promotedPiecesCanLandWhereTheyWantAfterCapture: boolean; // TODO implement
}

export class CheckersLocalizable {

    public static readonly STACK_PIECE: Localized = () => $localize`Stack piece instead of capturing it`;

    public static readonly MAXIMAL_CAPTURE: Localized = () => $localize`You must capture the highest number of piece`;

    public static readonly SIMPLE_PIECE_CAN_CAPTURE_BACKWARDS: Localized = () => $localize`Simple piece can back-capture`;

    public static readonly PROMOTED_PIECES_CAN_TRAVEL_LONG_DISTANCES: Localized = () => $localize`Promoted pieces can travel long distance`;

    public static readonly PROMOTED_PIECES_CAN_LAND_WHERE_THEY_WANT_AFTER_CAPTURE: Localized = () => $localize`Promoted pieces can travel long distance after capture`;

}

export class CheckersNode extends GameNode<CheckersMove, CheckersState> {}

export abstract class AbstractCheckersRules extends ConfigurableRules<CheckersMove, CheckersState, CheckersConfig> {

    public override getInitialState(optionalConfig: MGPOptional<CheckersConfig>): CheckersState {
        const O: CheckersStack = new CheckersStack([CheckersPiece.ZERO]);
        const X: CheckersStack = new CheckersStack([CheckersPiece.ONE]);
        const _: CheckersStack = CheckersStack.EMPTY;
        const config: CheckersConfig = optionalConfig.get();
        const height: number = config.emptyRows + (2 * config.playerRows);
        const board: CheckersStack[][] = TableUtils.create(config.width, height, _);
        for (let y: number = 0; y < config.playerRows; y++) {
            for (let x: number = 0; x < config.width; x++) {
                if ((x + y) % 2 === 0) { // TODO 1 for checkers 0 for lasca
                    board[y][x] = X;
                    board[height - 1 - y][config.width - 1 - x] = O;
                }
            }
        }
        return new CheckersState(board, 0);
    }

    public getCaptures(state: CheckersState, config: CheckersConfig): CheckersMove[] {
        const player: Player = state.getCurrentPlayer();
        return this.getCapturesOf(state, player, config);
    }

    public getCapturesOf(state: CheckersState, player: Player, config: CheckersConfig): CheckersMove[] {
        const captures: CheckersMove[] = [];
        const playerPieces: Coord[] = state.getStacksOf(player);
        for (const playerPiece of playerPieces) {
            captures.push(...this.getPieceCaptures(state, playerPiece, config));
        }
        return captures;
    }

    public getPieceCaptures(state: CheckersState, coord: Coord, config: CheckersConfig): CheckersMove[] {
        let pieceMoves: CheckersMove[] = [];
        const piece: CheckersStack = state.getPieceAt(coord);
        const pieceOwner: Player = piece.getCommander().player;
        const opponent: Player = pieceOwner.getOpponent();
        const directions: Ordinal[] = this.getPieceDirections(state, coord, true, config);
        const moved: CheckersStack = state.getPieceAt(coord);
        for (const direction of directions) {
            const captured: Coord = coord.getNext(direction, 1);
            if (state.isOnBoard(captured) && state.getPieceAt(captured).isCommandedBy(opponent)) {
                const landing: Coord = captured.getNext(direction, 1);
                if (state.isOnBoard(landing) && state.getPieceAt(landing).isEmpty()) {
                    const fakePostCaptureState: CheckersState = state
                        .remove(coord)
                        .remove(captured)
                        .set(landing, moved);
                    // Not needed to do the real capture
                    const startOfMove: CheckersMove = CheckersMove.fromCapture([coord, landing]).get();
                    const endsOfMoves: CheckersMove[] = this.getPieceCaptures(fakePostCaptureState, landing, config);
                    if (endsOfMoves.length === 0) {
                        pieceMoves = pieceMoves.concat(startOfMove);
                    } else {
                        const mergedMoves: CheckersMove[] =
                            endsOfMoves.map((m: CheckersMove) => startOfMove.concatenate(m));
                        pieceMoves = pieceMoves.concat(mergedMoves);
                    }
                }
            }
        }
        return pieceMoves;
    }

    private getPieceDirections(state: CheckersState, coord: Coord, isCapture: boolean, config: CheckersConfig)
    : Ordinal[]
    {
        const piece: CheckersStack = state.getPieceAt(coord);
        const pieceOwner: Player = piece.getCommander().player;
        // Since player zero must go up (-1) and player one go down (+1)
        // Then we can use the score modifier that happens to match to the "vertical direction" of each player
        const verticalDirection: number = pieceOwner.getScoreModifier();
        const directions: Ordinal[] = [
            Ordinal.factory.fromDelta(-1, verticalDirection).get(),
            Ordinal.factory.fromDelta(1, verticalDirection).get(),
        ];
        const isLegalCaptureBackward: boolean = isCapture && config.simplePieceCanCaptureBackwards;
        if (state.getPieceAt(coord).getCommander().isOfficer || isLegalCaptureBackward) {
            const leftDiagonal: Ordinal = Ordinal.factory.fromDelta(-1, - verticalDirection).get();
            const rightDiagonal: Ordinal = Ordinal.factory.fromDelta(1, - verticalDirection).get();
            directions.push(leftDiagonal, rightDiagonal);
        }
        return directions;
    }

    public getSteps(state: CheckersState, config: CheckersConfig): CheckersMove[] {
        const player: Player = state.getCurrentPlayer();
        return this.getStepsOf(state, player, config);
    }

    public getStepsOf(state: CheckersState, player: Player, config: CheckersConfig): CheckersMove[] {
        const steps: CheckersMove[] = [];
        const playerStacks: Coord[] = state.getStacksOf(player);
        for (const playerPiece of playerStacks) {
            steps.push(...this.getPieceSteps(state, playerPiece, config));
        }
        return steps;
    }

    public getPieceSteps(state: CheckersState, coord: Coord, config: CheckersConfig): CheckersMove[] {
        const pieceMoves: CheckersMove[] = [];
        const directions: Ordinal[] = this.getPieceDirections(state, coord, false, config);
        for (const direction of directions) {
            if (state.getPieceAt(coord).getCommander().isOfficer && config.promotedPiecesCanTravelLongDistances) {
                let landing: Coord = coord;
                let previousJumpWasPossible: boolean = true;
                while (previousJumpWasPossible) {
                    landing = landing.getNext(direction, 1);
                    previousJumpWasPossible = state.isOnBoard(landing) && state.getPieceAt(landing).isEmpty();
                    if (previousJumpWasPossible) {
                        const newStep: CheckersMove = CheckersMove.fromStep(coord, landing);
                        pieceMoves.push(newStep);
                    }
                }
            } else {
                const landing: Coord = coord.getNext(direction, 1);
                if (state.isOnBoard(landing) && state.getPieceAt(landing).isEmpty()) {
                    const newStep: CheckersMove = CheckersMove.fromStep(coord, landing);
                    pieceMoves.push(newStep);
                }
            }
        }
        return pieceMoves;
    }

    public override applyLegalMove(move: CheckersMove, state: CheckersState, config: MGPOptional<CheckersConfig>)
    : CheckersState
    {
        const moveStart: Coord = move.getStartingCoord();
        const moveEnd: Coord = move.getEndingCoord();
        let movingStack: CheckersStack = state.getPieceAt(moveStart);
        let resultingState: CheckersState = state.remove(moveStart);
        if (this.isMoveStep(move) === false) {
            for (const capturedCoord of move.getCapturedCoords().get()) {
                if (config.get().stackPiece) {
                    const capturedSpace: CheckersStack = state.getPieceAt(capturedCoord);
                    const commander: CheckersPiece = capturedSpace.getCommander();
                    movingStack = movingStack.capturePiece(commander);

                    const remainingStack: CheckersStack = capturedSpace.getPiecesUnderCommander();
                    resultingState = resultingState.set(capturedCoord, remainingStack);
                } else {
                    resultingState = resultingState.set(capturedCoord, CheckersStack.EMPTY);
                }
            }
        }
        resultingState = resultingState.set(moveEnd, movingStack);
        if (moveEnd.y === state.getFinishLineOf(state.getCurrentPlayer())) {
            const promotedCommander: CheckersStack = movingStack.promoteCommander();
            resultingState = resultingState.set(moveEnd, promotedCommander);
        }
        return resultingState.incrementTurn();
    }

    public override isLegal(move: CheckersMove, state: CheckersState, config: MGPOptional<CheckersConfig>)
    : MGPValidation
    {
        const outOfRangeCoord: MGPOptional<Coord> = this.getMoveOutOfRangeCoord(move, config.get());
        if (outOfRangeCoord.isPresent()) {
            return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(outOfRangeCoord.get()));
        }
        const moveStart: Coord = move.getStartingCoord();
        if (state.getPieceAt(moveStart).isEmpty()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        const movedStack: CheckersStack = state.getPieceAt(moveStart);
        const opponent: Player = state.getCurrentOpponent();
        if (movedStack.isCommandedBy(opponent)) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        if (movedStack.getCommander().isOfficer) {
            const promotedPieceMoveValidity: MGPValidation =
                this.isLegalMoveForPromotedPiece(move, state);
            if (promotedPieceMoveValidity.isFailure()) {
                return promotedPieceMoveValidity;
            }
        } else {
            const normalPieceMoveValidity: MGPValidation =
                this.isLegalMoveForNormalPiece(move, state, config.get());
            if (normalPieceMoveValidity.isFailure()) {
                return normalPieceMoveValidity;
            }
        }
        const possibleCaptures: CheckersMove[] = this.getCaptures(state, config.get());
        if (possibleCaptures.length === 0) {
            return MGPValidation.SUCCESS;
        } else {
            return this.isLegalCaptureChoice(move, possibleCaptures, config.get());
        }
    }

    private getMoveOutOfRangeCoord(move: CheckersMove, config: CheckersConfig): MGPOptional<Coord> {
        const configHeight: number = config.emptyRows + (2 * config.playerRows);
        for (const coord of move.coords) {
            if (coord.isNotInRange(config.width, configHeight)) {
                return MGPOptional.of(coord);
            }
        }
        return MGPOptional.empty();
    }

    private isLegalMoveForPromotedPiece(move: CheckersMove, state: CheckersState)
    : MGPValidation
    {
        let moveIsNotACapture: boolean = false;
        for (let i: number = 1; i < move.coords.size(); i++) {
            if (moveIsNotACapture) {
                return MGPValidation.failure('Cannot continue move after non-capture move');
            }
            const previousCoord: Coord = move.coords.get(i - 1);
            const landingCoord: Coord = move.coords.get(i);
            const landingPiece: CheckersStack = state.getPieceAt(landingCoord);
            if (landingPiece.getStackSize() > 0) {
                return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
            }
            const direction: MGPFallible<Ordinal> = previousCoord.getDirectionToward(landingCoord);
            if (direction.isFailure()) {
                return direction.toOtherFallible();
            }
            const flyiedOverPlayer: Player[] = this.getFlyiedOverPlayers(previousCoord, landingCoord, state);
            if (flyiedOverPlayer.length === 0) {
                moveIsNotACapture = true;
            } else if (flyiedOverPlayer.length > 1) {
                return MGPValidation.failure(CheckersFailure.CANNOT_JUMP_OVER_SEVERAL_PIECES());
            } else if (flyiedOverPlayer.some((player: Player) => player.equals(state.getCurrentPlayer()))) {
                return MGPValidation.failure(RulesFailure.CANNOT_SELF_CAPTURE());
            }
        }
        return MGPValidation.SUCCESS;
    }

    private getFlyiedOverPlayers(start: Coord, end: Coord, state: CheckersState): Player[] {
        const flyiedOverCoords: Coord[] = start.getCoordsToward(end);
        const flyiedOverPieces: CheckersStack[] = flyiedOverCoords.map((coord: Coord) => state.getPieceAt(coord));
        const flyiedOverOccupiedStacks: CheckersStack[] =
            flyiedOverPieces.filter((stack: CheckersStack) => stack.isOccupied());
        return flyiedOverOccupiedStacks.map((stack: CheckersStack) => stack.getCommander().player);
    }

    private isLegalMoveForNormalPiece(move: CheckersMove, state: CheckersState, config: CheckersConfig)
    : MGPValidation
    {
        if (this.isMoveStep(move)) {
            return this.isLegalStepForNormalPiece(move, state);
        } else {
            return this.isLegalCaptureForNormalPiece(move, state, config);
        }
    }

    private isLegalStepForNormalPiece(move: CheckersMove, state: CheckersState)
    : MGPValidation
    {
        const landing: Coord = move.getEndingCoord();
        if (state.getPieceAt(landing).isEmpty() === false) {
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        } else {
            const moveStart: Coord = move.getStartingCoord();
            const moveDirection: number = moveStart.getDirectionToward(landing).get().y;
            const opponent: Player = state.getCurrentOpponent();
            if (moveDirection === opponent.getScoreModifier()) {
                return MGPValidation.failure(CheckersFailure.CANNOT_GO_BACKWARD());
            } else {
                return MGPValidation.SUCCESS;
            }
        }
    }

    private isLegalCaptureForNormalPiece(move: CheckersMove, state: CheckersState, config: CheckersConfig)
    : MGPValidation
    {
        let i: number = 1;
        const opponent: Player = state.getCurrentOpponent();
        while (i < move.coords.size()) {
            // TODO: check sub-capture that goes backward, not only start-end
            const previousCoord: Coord = move.coords.get(i - 1);
            const coord: Coord = move.coords.get(i);
            const moveDirection: Ordinal = previousCoord.getDirectionToward(coord).get();
            const moveVerticalDirection: number = moveDirection.y;
            if (moveDirection.isOrthogonal()) {
                return MGPValidation.failure(CheckersFailure.CANNOT_DO_ORTHOGONAL_MOVE());
            } else if (moveVerticalDirection === opponent.getScoreModifier() &&
                config.simplePieceCanCaptureBackwards === false)
            { // TODO change to *capture* illegally
                return MGPValidation.failure(CheckersFailure.CANNOT_GO_BACKWARD());
            }
            const flyiedOverPlayers: Player[] = this.getFlyiedOverPlayers(previousCoord, coord, state);
            const moveDistance: number = previousCoord.getDistanceToward(coord);
            if (flyiedOverPlayers.length === 0) {
                if (moveDistance > 2) {
                    return MGPValidation.failure(CheckersFailure.NORMAL_PIECES_CANNOT_MOVE_LIKE_THIS());
                } else {
                    return MGPValidation.failure(CheckersFailure.CANNOT_CAPTURE_EMPTY_SPACE());
                }
            } else if (flyiedOverPlayers.length > 1) {
                return MGPValidation.failure(CheckersFailure.CANNOT_JUMP_OVER_SEVERAL_PIECES());
            }
            if (moveDistance !== 2) {
                return MGPValidation.failure(CheckersFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL());
            }
            const flyiedOverPlayer: Player = flyiedOverPlayers[0];
            if (flyiedOverPlayer.equals(state.getCurrentPlayer())) {
                return MGPValidation.failure(RulesFailure.CANNOT_SELF_CAPTURE());
            }
            i++;
        }
        const possibleCaptures: CheckersMove[] = this.getCaptures(state, config);
        return this.isLegalCaptureChoice(move, possibleCaptures, config);
    }

    private isNormalPieceCapturingBackwardIllegaly(move: CheckersMove, state: CheckersState, config: CheckersConfig)
    : boolean
    {
        if (this.isMoveStep(move)) {
            return false;
        }
        const movingPiece: CheckersPiece = state.getPieceAt(move.getStartingCoord()).getCommander();
        if (movingPiece.isOfficer) {
            return false;
        }
        let i: number = 1;
        const opponent: Player = state.getCurrentOpponent();
        while (i < move.coords.size()) {
            // TODO: check sub-capture that goes backward, not only start-end
            const previousCoord: Coord = move.coords.get(i - 1);
            const coord: Coord = move.coords.get(i);
            const moveDirection: number = previousCoord.getDirectionToward(coord).get().y;
            if (moveDirection === opponent.getScoreModifier() && config.simplePieceCanCaptureBackwards === false) {
                return true;
            }
            i++;
        }
        return false;
    }

    public isMoveStep(move: CheckersMove): boolean {
        if (move.coords.size() === 2) {
            const start: Coord = move.getStartingCoord();
            const end: Coord = move.getEndingCoord();
            const distance: number = start.getDistanceToward(end);
            return distance === 1;
        } else {
            return false;
        }
    }

    public isLegalCapture(move: CheckersMove,
                          state: CheckersState,
                          possibleCaptures: CheckersMove[],
                          config: CheckersConfig)
    : MGPValidation
    {
        const player: Player = state.getCurrentPlayer();
        const steppedOverCoords: CoordSet = move.getCapturedCoords().get();
        for (const steppedOverCoord of steppedOverCoords) {
            const steppedOverSpace: CheckersStack = state.getPieceAt(steppedOverCoord);
            if (steppedOverSpace.isCommandedBy(player)) {
                return MGPValidation.failure(RulesFailure.CANNOT_SELF_CAPTURE());
            }
            if (steppedOverSpace.isEmpty()) {
                return MGPValidation.failure(CheckersFailure.CANNOT_CAPTURE_EMPTY_SPACE());
            }
        }
        if (this.isNormalPieceCapturingBackwardIllegaly(move, state, config)) {
            return MGPValidation.failure(CheckersFailure.CANNOT_GO_BACKWARD()); // TODO change to "capture"
        }
        return this.isLegalCaptureChoice(move, possibleCaptures, config);
    }

    /**
     * @param move the chosen capture
     * @param possibleCaptures all possible captures
     * @param config the config
     * @returns wether or not this move is amongst the possible capture, based on global-capture group
     * The check aspect are only based on the rules maximalCapture and partialCapture rules
     */
    private isLegalCaptureChoice(move: CheckersMove,
                                 possibleCaptures: CheckersMove[],
                                 config: CheckersConfig)
    : MGPValidation
    {
        if (config.maximalCapture) {
            const legalCaptures: CheckersMove[] =
                ArrayUtils.maximumsBy(possibleCaptures, (m: CheckersMove) => m.coords.size());
            const awaitedCaptureSize: number = legalCaptures[0].coords.size();
            if (this.isMoveStep(move)) {
                return MGPValidation.failure(CheckersFailure.CANNOT_SKIP_CAPTURE());
            } else if (move.coords.size() === awaitedCaptureSize) {
                return MGPValidation.SUCCESS;
            } else if (legalCaptures.some((m: CheckersMove) => move.isPrefix(m))) {
                return MGPValidation.failure(CheckersFailure.MUST_FINISH_CAPTURING());
            } else {
                return MGPValidation.failure(CheckersFailure.MUST_DO_BIGGEST_CAPTURE());
            }
        } else {
            if (this.isMoveStep(move)) {
                return MGPValidation.failure(CheckersFailure.CANNOT_SKIP_CAPTURE());
            } else if (possibleCaptures.some((m: CheckersMove) => m.equals(move))) {
                return MGPValidation.SUCCESS;
            } else {
                return MGPValidation.failure(CheckersFailure.MUST_FINISH_CAPTURING());
            }
        }
    }

    public override getGameStatus(node: CheckersNode, config: MGPOptional<CheckersConfig>): GameStatus {
        const state: CheckersState = node.gameState;
        const captures: CheckersMove[] = this.getCaptures(state, config.get());
        if (captures.length > 0 || this.getSteps(state, config.get()).length > 0) {
            return GameStatus.ONGOING;
        } else {
            return GameStatus.getVictory(state.getCurrentOpponent());
        }
    }

}
