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
    promotedPiecesCanFly: boolean;
}

export class CheckersLocalizable {

    public static readonly STACK_PIECE: Localized = () => $localize`Stack piece instead of capturing it`;

    public static readonly MAXIMAL_CAPTURE: Localized = () => $localize`You must capture the highest number of piece`;

    public static readonly SIMPLE_PIECE_CAN_CAPTURE_BACKWARDS: Localized = () => $localize`Simple piece can back-capture`;

    public static readonly PROMOTED_PIECES_CAN_TRAVEL_LONG_DISTANCES: Localized = () => $localize`Promoted pieces can travel long distance`;

}

export class CheckersNode extends GameNode<CheckersMove, CheckersState> {}

export abstract class AbstractCheckersRules extends ConfigurableRules<CheckersMove, CheckersState, CheckersConfig> {

    public override getInitialState(optionalConfig: MGPOptional<CheckersConfig>): CheckersState {
        const U: CheckersStack = new CheckersStack([CheckersPiece.ZERO]);
        const V: CheckersStack = new CheckersStack([CheckersPiece.ONE]);
        const _: CheckersStack = CheckersStack.EMPTY;
        const config: CheckersConfig = optionalConfig.get();
        const height: number = config.emptyRows + (2 * config.playerRows);
        const board: CheckersStack[][] = TableUtils.create(config.width, height, _);
        for (let y: number = 0; y < config.playerRows; y++) {
            for (let x: number = 0; x < config.width; x++) {
                if ((x + y) % 2 === 0) { // TODO 1 for checkers 0 for lasca
                    board[y][x] = V;
                    board[height - 1 - y][config.width - 1 - x] = U;
                }
            }
        }
        return new CheckersState(board, 0);
    }

    /**
     * @param state the state from which you want the current player's capture
     * @param config the config
     * @returns all the complete capture, wether or not they are legal
     */
    public getCompleteCaptures(state: CheckersState, config: CheckersConfig): CheckersMove[] {
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

    public getPieceCaptures(state: CheckersState, coord: Coord, config: CheckersConfig, flyiedOvers: Coord[] = [])
    : CheckersMove[]
    {
        let pieceMoves: CheckersMove[] = [];
        const piece: CheckersStack = state.getPieceAt(coord);
        const pieceOwner: Player = piece.getCommander().player;
        const opponent: Player = pieceOwner.getOpponent();
        const directions: Ordinal[] = this.getPieceDirections(state, coord, true, config);
        const moved: CheckersStack = state.getPieceAt(coord);
        for (const direction of directions) {
            const captured: MGPOptional<Coord> =
                this.getFirstCapturableCoord(state, coord, direction, opponent, flyiedOvers, config);
            if (captured.isPresent()) {
                // const landing: Coord = captured.get().getNext(direction, 1);
                const landings: Coord[] =
                    this.getLandableCoords(state, coord, captured.get(), direction, flyiedOvers, config);
                for (const landing of landings) {
                    const fakePostCaptureState: CheckersState = state
                        .remove(coord)
                        .remove(captured.get())
                        .set(landing, moved);
                    // Not needed to do the real capture
                    const startOfMove: CheckersMove = CheckersMove.fromCapture([coord, landing]).get();
                    const newFlyiedOvers: Coord[] = flyiedOvers.concat(...coord.getAllCoordsToward(landing));
                    const endsOfMoves: CheckersMove[] = this.getPieceCaptures(fakePostCaptureState,
                                                                              landing,
                                                                              config,
                                                                              newFlyiedOvers);
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

    private getFirstCapturableCoord(state: CheckersState,
                                    coord: Coord,
                                    direction: Ordinal,
                                    opponent: Player,
                                    flyiedOvers: Coord[],
                                    config: CheckersConfig)
    : MGPOptional<Coord>
    {
        const isPromotedPiece: boolean = state.getPieceAt(coord).getCommander().isPromoted;
        if (config.promotedPiecesCanFly && isPromotedPiece) {
            return this.getFirstCapturableCoordForFlyingCapture(state, coord, direction, flyiedOvers);
        } else {
            const nextCoord: Coord = coord.getNext(direction, 1);
            if (state.isOnBoard(nextCoord) &&
                state.getPieceAt(nextCoord).isCommandedBy(opponent) &&
                flyiedOvers.some((c: Coord) => c.equals(nextCoord)) === false)
            {
                return MGPOptional.of(nextCoord);
            } else {
                return MGPOptional.empty();
            }
        }
    }

    private getLandableCoords(state: CheckersState,
                              coord: Coord,
                              captured: Coord,
                              direction: Ordinal,
                              flyiedOvers: Coord[],
                              config: CheckersConfig)
    : Coord[]
    {
        let possibleLanding: Coord = captured.getNext(direction, 1);
        const possibleLandings: Coord[] = [];
        if (state.isOnBoard(possibleLanding) &&
            state.getPieceAt(possibleLanding).isEmpty() &&
            flyiedOvers.some((c: Coord) => c.equals(possibleLanding)) === false)
        {
            possibleLandings.push(possibleLanding);
            const isPromotedPiece: boolean = state.getPieceAt(coord).getCommander().isPromoted;
            if (config.promotedPiecesCanFly && isPromotedPiece) {
                possibleLanding = possibleLanding.getNext(direction, 1);
                while (state.isOnBoard(possibleLanding) &&
                       state.getPieceAt(possibleLanding).isEmpty() &&
                       flyiedOvers.some((c: Coord) => c.equals(possibleLanding)) === false)
                {
                    possibleLandings.push(possibleLanding);
                    possibleLanding = possibleLanding.getNext(direction, 1);
                }
            }
        }
        return possibleLandings;
    }

    private getFirstCapturableCoordForFlyingCapture(state: CheckersState,
                                                    coord: Coord,
                                                    direction: Ordinal,
                                                    flyiedOvers: Coord[])
    : MGPOptional<Coord>
    {
        const player: Player = state.getCurrentPlayer();
        const nextCoord: Coord = coord.getNext(direction, 1);
        if (state.isNotOnBoard(nextCoord) ||
            state.getPieceAt(nextCoord).isCommandedBy(player) ||
            flyiedOvers.some((c: Coord) => c.equals(nextCoord)))
        {
            return MGPOptional.empty();
        } else {
            if (state.getPieceAt(nextCoord).isEmpty()) {
                return this.getFirstCapturableCoordForFlyingCapture(state, nextCoord, direction, flyiedOvers);
            } else {
                return MGPOptional.of(nextCoord);
            }
        }
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
        if (state.getPieceAt(coord).getCommander().isPromoted || isLegalCaptureBackward) {
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
            const isPromotedPiece: boolean = state.getPieceAt(coord).getCommander().isPromoted;
            if (config.promotedPiecesCanFly && isPromotedPiece) {
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
            for (const capturedCoord of this.getCapturedCoords(move, state)) {
                if (config.get().stackPiece) {
                    const capturedSpace: CheckersStack = state.getPieceAt(capturedCoord);
                    const capturedCommander: CheckersPiece = capturedSpace.getCommander();
                    movingStack = movingStack.capturePiece(capturedCommander);

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

    private getCapturedCoords(move: CheckersMove, state: CheckersState): CoordSet {
        const steppedOverCoords: CoordSet = move.getSteppedOverCoords().get();
        return steppedOverCoords.filter((coord: Coord) =>
            state.getPieceAt(coord).isOccupied() &&
            coord.equals(move.getStartingCoord()) === false);
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
        const moveValidity: MGPValidation = this.isLegalSubMoveList(move, state, config.get());
        if (moveValidity.isFailure()) {
            return moveValidity;
        }
        const possibleCaptures: CheckersMove[] = this.getCompleteCaptures(state, config.get());
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

    private isLegalSubMoveList(move: CheckersMove, state: CheckersState, config: CheckersConfig): MGPValidation {
        for (let i: number = 1; i < move.coords.size(); i++) {
            const previousCoord: Coord = move.coords.get(i - 1);
            const landingCoord: Coord = move.coords.get(i);
            const landingPiece: CheckersStack = state.getPieceAt(landingCoord);
            if (landingPiece.getStackSize() > 0) {
                return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
            }
            const direction: MGPFallible<Ordinal> = previousCoord.getDirectionToward(landingCoord);
            if (direction.isFailure()) {
                return direction.toOtherFallible();
            } else if (direction.get().isOrthogonal()) {
                return MGPValidation.failure(CheckersFailure.CANNOT_DO_ORTHOGONAL_MOVE());
            }
            const flyiedOverPlayer: Player[] = this.getFlyiedOverPlayers(previousCoord, landingCoord, state);
            let isCapture: boolean;
            if (flyiedOverPlayer.length === 0) { // No Capture
                if (this.isMisplacedStep(move)) { // The moves continue illegally
                    return MGPValidation.failure('Move cannot continue after non-capture move');
                }
                isCapture = false;
            } else if (flyiedOverPlayer.length > 1) { // Capturing 2+ pieces
                return MGPValidation.failure(CheckersFailure.CANNOT_JUMP_OVER_SEVERAL_PIECES());
            } else { // Single Capture
                if (flyiedOverPlayer.some((player: Player) => player.equals(state.getCurrentPlayer()))) {
                    return MGPValidation.failure(RulesFailure.CANNOT_SELF_CAPTURE());
                }
                isCapture = true;
            }
            if (this.isNormalPieceGoingBackwardIllegaly(move, previousCoord, landingCoord, state, config)) {
                return MGPValidation.failure(CheckersFailure.CANNOT_GO_BACKWARD());
            }
            const flyLegality: MGPValidation =
                this.getFlyLegality(move, previousCoord, landingCoord, state, isCapture, config);
            if (flyLegality.isFailure()) {
                return flyLegality;
            }
        }
        return MGPValidation.SUCCESS;
    }

    private isMisplacedStep(move: CheckersMove): boolean {
        if (move.coords.size() === 2) {
            // This is a simple jump without capture, must be a promoted piece (this part is checked later)
            return false;
        } else {
            // We've been this far with capture but this step has no capture, this is misplaced !
            return true;
        }
    }

    private getFlyiedOverPlayers(start: Coord, end: Coord, state: CheckersState): Player[] {
        const flyiedOverCoords: Coord[] = start.getCoordsToward(end);
        const flyiedOverPieces: CheckersStack[] = flyiedOverCoords.map((coord: Coord) => state.getPieceAt(coord));
        const flyiedOverOccupiedStacks: CheckersStack[] =
            flyiedOverPieces.filter((stack: CheckersStack) => stack.isOccupied());
        return flyiedOverOccupiedStacks.map((stack: CheckersStack) => stack.getCommander().player);
    }

    /**
     * @param move a simple move, (start/end, nothing more)
     */
    private isNormalPieceGoingBackwardIllegaly(move: CheckersMove,
                                               stepStart: Coord,
                                               stepEnd: Coord,
                                               state: CheckersState,
                                               config: CheckersConfig)
    : boolean
    {
        const movingPiece: CheckersPiece = state.getPieceAt(move.getStartingCoord()).getCommander();
        if (movingPiece.isPromoted) {
            return false;
        } // Here: we check a normal piece
        const opponent: Player = state.getCurrentOpponent();
        const moveDirection: number = stepStart.getDirectionToward(stepEnd).get().y;
        const distance: number = stepStart.getDistanceToward(stepEnd);
        const isBackward: boolean = moveDirection === opponent.getScoreModifier();
        if (isBackward) {
            if (distance === 1) {
                return true; // Piece is stepping backward illegally
            } else if (config.simplePieceCanCaptureBackwards === false) {
                return true; // Piece is backcapturing illegally
            } else {
                return false; // Legal backward
            }
        } else {
            return false; // Legal forward
        }
    }

    private getFlyLegality(move: CheckersMove,
                           stepStart: Coord,
                           stepEnd: Coord,
                           state: CheckersState,
                           isCapture: boolean,
                           config: CheckersConfig)
    : MGPValidation
    {
        const distance: number = stepStart.getDistanceToward(stepEnd);
        if (distance === 1 && isCapture === false) {
            return MGPValidation.SUCCESS;
        }
        if (distance === 2 && isCapture) {
            return MGPValidation.SUCCESS;
        }
        if (config.promotedPiecesCanFly) {
            if (state.getPieceAt(move.getStartingCoord()).getCommander().isPromoted) {
                return MGPValidation.SUCCESS; // Legal promoted fly
            } else { // Normal piece cannot fly
                if (isCapture) {
                    return MGPValidation.failure(CheckersFailure.NORMAL_PIECES_CANNOT_CAPTURE_LIKE_THIS());
                } else {
                    return MGPValidation.failure(CheckersFailure.NORMAL_PIECES_CANNOT_MOVE_LIKE_THIS());
                }
            }
        } else { // No piece are allow flying
            return MGPValidation.failure(CheckersFailure.NO_PIECE_CAN_FLY());
        }
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

    public getLegalCaptures(state: CheckersState, config: CheckersConfig): CheckersMove[] {
        const possibleCaptures: CheckersMove[] = this.getCompleteCaptures(state, config);
        if (config.maximalCapture) {
            return ArrayUtils.maximumsBy(possibleCaptures, (m: CheckersMove) => m.coords.size());
        } else {
            return possibleCaptures;
        }
    }

    public override getGameStatus(node: CheckersNode, config: MGPOptional<CheckersConfig>): GameStatus {
        const state: CheckersState = node.gameState;
        const captures: CheckersMove[] = this.getCompleteCaptures(state, config.get());
        if (captures.length > 0 || this.getSteps(state, config.get()).length > 0) {
            return GameStatus.ONGOING;
        } else {
            return GameStatus.getVictory(state.getCurrentOpponent());
        }
    }

}
