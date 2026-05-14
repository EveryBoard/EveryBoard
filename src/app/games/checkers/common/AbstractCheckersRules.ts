import { ArrayUtils, MGPFallible, MGPOptional, MGPUniqueList, MGPValidation, Utils } from '@everyboard/lib';

import { GameNode } from '../../../jscaip/AI/GameNode';
import { Coord, CoordFailure } from '../../../jscaip/Coord';
import { GameStatus } from '../../../jscaip/GameStatus';
import { Ordinal } from '../../../jscaip/Ordinal';
import { Player } from '../../../jscaip/Player';
import { ConfigurableRules } from '../../../jscaip/Rules';
import { RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { RulesFailure } from '../../../jscaip/RulesFailure';
import { TableUtils } from '../../../jscaip/TableUtils';
import { Vector } from '../../../jscaip/Vector';
import { Localized } from '../../../utils/LocaleUtils';

import { CheckersFailure } from './CheckersFailure';
import { CheckersMove } from './CheckersMove';
import { CheckersPiece, CheckersStack, CheckersState } from './CheckersState';

export type CheckersConfig = RulesConfig & {

    playerRows: number;

    emptyRows: number;

    width: number;

    canStackPieces: boolean;

    mustMakeMaximalCapture: boolean;

    simplePieceCanCaptureBackwards: boolean;

    promotedPiecesCanFly: boolean;

    occupyEvenSquare: boolean;

    frisianCaptureAllowed: boolean;

    canPromoteMidCapture: boolean;

};

export class CheckersOptionLocalizable {

    public static readonly STACK_PIECES: Localized = () => $localize`Stack pieces instead of capturing them`;

    public static readonly MAXIMAL_CAPTURE: Localized = () => $localize`You must capture the highest number of pieces`;

    public static readonly SIMPLE_PIECE_CAN_CAPTURE_BACKWARDS: Localized = () => $localize`Simple pieces can capture backward`;

    public static readonly PROMOTED_PIECES_CAN_TRAVEL_LONG_DISTANCES: Localized = () => $localize`Promoted pieces can travel long distance`;

    public static readonly OCCUPY_EVEN_SQUARE: Localized = () => $localize`Occupy upper-left corner`;

    public static readonly FRISIAN_CAPTURE_ALLOWED: Localized = () => $localize`Can do frisian captures`;

    public static readonly CAN_PROMOTE_MID_CAPTURE: Localized =
        () => $localize`Piece that reaches the last line during a capture continues capturing as king`;

    public static readonly ALLOW_PATH_CROSSING: Localized = () => $localize`Allow path crossing during multi-jump`;

}

export class CheckersNode extends GameNode<CheckersMove, CheckersState> {}

export abstract class AbstractCheckersRules extends ConfigurableRules<CheckersMove, CheckersState, CheckersConfig> {

    public override getInitialState(config: CheckersConfig): CheckersState {
        const U: CheckersStack = new CheckersStack([CheckersPiece.ZERO]);
        const V: CheckersStack = new CheckersStack([CheckersPiece.ONE]);
        const _: CheckersStack = CheckersStack.EMPTY;
        const height: number = config.emptyRows + (2 * config.playerRows);
        const board: CheckersStack[][] = TableUtils.create(config.width, height, _);
        const occupiedSquare: number = config.occupyEvenSquare ? 0 : 1;
        for (let y: number = 0; y < height; y++) {
            for (let x: number = 0; x < config.width; x++) {
                if ((x + y) % 2 === occupiedSquare) {
                    if (y < config.playerRows) {
                        board[y][x] = V;
                    } else if (config.playerRows + config.emptyRows <= y) {
                        board[y][x] = U;
                    }
                }
            }
        }
        return new CheckersState(board, 0);
    }

    /**
     * @param state the state from which you want the current player's capture
     * @param config the config
     * @returns all the complete captures, whether or not they are legal
     */
    public getCompleteCaptures(state: CheckersState, config: CheckersConfig): CheckersMove[] {
        const player: Player = state.getCurrentPlayer();
        return this.getCapturesOf(state, player, config);
    }

    public getCapturesOf(state: CheckersState, player: Player, config: CheckersConfig): CheckersMove[] {
        const captures: CheckersMove[] = [];
        const playerPieces: Coord[] = state.getStacksOf(player);
        for (const playerPiece of playerPieces) {
            captures.push(...this.getPieceCaptures(state, playerPiece, config, [playerPiece]));
        }
        return captures;
    }

    private getPieceCaptures(state: CheckersState,
                             coord: Coord,
                             config: CheckersConfig,
                             flownOvers: Coord[])
    : CheckersMove[]
    {
        let pieceMoves: CheckersMove[] = [];
        const piece: CheckersStack = state.getPieceAt(coord);
        const pieceOwner: Player = piece.getCommander().player;
        const opponent: Player = pieceOwner.getOpponent();
        const directions: Vector[] = this.getPieceDirections(state, coord, true, config);
        for (const direction of directions) {
            const captured: MGPOptional<Coord> =
                this.getFirstCapturableCoord(state, coord, direction, opponent, flownOvers, config);
            if (captured.isPresent()) {
                const landings: Coord[] =
                    this.getLandableCoords(state, coord, captured.get(), direction, config);
                for (const landing of landings) {
                    const postCapture: { state: CheckersState, piece: CheckersStack } =
                        this.applyCapture(state, coord, captured.get(), landing, config);

                    const startOfMove: CheckersMove = CheckersMove.fromCapture([coord, landing]);
                    const newFlownOvers: Coord[] = flownOvers.concat(captured.get());

                    const endsOfMoves: CheckersMove[] = this.getPieceCaptures(postCapture.state,
                                                                              landing,
                                                                              config,
                                                                              newFlownOvers);
                    if (endsOfMoves.length === 0) {
                        pieceMoves = pieceMoves.concat(startOfMove);
                    } else {
                        const mergedMoves: CheckersMove[] = endsOfMoves.map((endMove: CheckersMove) => {
                            return startOfMove.concatenate(endMove);
                        });
                        pieceMoves = pieceMoves.concat(mergedMoves);
                    }
                }
            }
        }
        return pieceMoves;
    }

    private applyCapture(state: CheckersState, start: Coord, captured: Coord, landing: Coord, config: CheckersConfig)
    : { state: CheckersState, piece: CheckersStack }
    {
        const moved: CheckersStack = state.getPieceAt(start);
        const pieceOwner: Player = moved.getCommander().player;
        let fakePostCaptureState: CheckersState = state.remove(start);
        let landingPiece: CheckersStack = moved;
        if (config.canStackPieces) {
            const capturedSpace: CheckersStack = state.getPieceAt(captured);
            const remainingStack: CheckersStack = capturedSpace.getPiecesUnderCommander();
            fakePostCaptureState = fakePostCaptureState.set(captured, remainingStack);
            landingPiece = moved.capturePiece(capturedSpace.getCommander());
        }
        if (config.canPromoteMidCapture && landing.y === state.getFinishLineOf(pieceOwner)) {
            landingPiece = landingPiece.promoteCommander();
        }
        fakePostCaptureState = fakePostCaptureState.set(landing, landingPiece);
        return { state: fakePostCaptureState, piece: landingPiece };
    }

    private getFirstCapturableCoord(state: CheckersState,
                                    coord: Coord,
                                    direction: Vector,
                                    opponent: Player,
                                    flownOvers: Coord[],
                                    config: CheckersConfig)
    : MGPOptional<Coord>
    {
        const isPromotedPiece: boolean = state.getPieceAt(coord).getCommander().isPromoted;
        if (config.promotedPiecesCanFly && isPromotedPiece) {
            return this.getFirstCapturableCoordForFlyingCapture(state, coord, direction, flownOvers, config);
        } else {
            const nextCoord: Coord = coord.getNext(direction, 1);
            if (state.coordIsCommandedBy(nextCoord, opponent) &&
                this.isPresentIn(nextCoord, flownOvers) === false)
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
                              direction: Vector,
                              config: CheckersConfig)
    : Coord[]
    {
        let possibleLanding: MGPOptional<Coord> =
            this.getNextPossibleLanding(state, captured, direction);
        const possibleLandings: Coord[] = [];
        if (possibleLanding.isPresent()) {
            possibleLandings.push(possibleLanding.get());
            const isPromotedPiece: boolean = state.getPieceAt(coord).getCommander().isPromoted;
            if (config.promotedPiecesCanFly && isPromotedPiece) {
                possibleLanding =
                    this.getNextPossibleLanding(state, possibleLanding.get(), direction);
                while (possibleLanding.isPresent()) {
                    possibleLandings.push(possibleLanding.get());
                    possibleLanding =
                        this.getNextPossibleLanding(state, possibleLanding.get(), direction);
                }
            }
        }
        return possibleLandings;
    }

    private getNextPossibleLanding(state: CheckersState,
                                   coord: Coord,
                                   direction: Vector)
    : MGPOptional<Coord>
    {
        // A frisian capture can do even move but fly over even coord as well
        // so we must make a distinction between minimalisedDirection and direction
        const minimalisedDirection: Vector = direction.toMinimalVector();
        const nextPossibleLanding: Coord = coord.getNext(direction, 1);
        const distance: number = coord.getDistanceToward(nextPossibleLanding);
        let i: number = 0;
        while (i < distance) {
            coord = coord.getNext(minimalisedDirection, 1);
            if (state.isEmptyAt(coord) === false) {
                return MGPOptional.empty();
            }
            i++;
        }
        return MGPOptional.of(nextPossibleLanding);
    }

    private isPresentIn(coord: Coord, coordList: Coord[]): boolean {
        return coordList.some((c: Coord) => c.equals(coord));
    }

    private getFirstCapturableCoordForFlyingCapture(state: CheckersState,
                                                    coord: Coord,
                                                    direction: Vector,
                                                    flownOvers: Coord[],
                                                    config: CheckersConfig)
    : MGPOptional<Coord>
    {
        const minimalisedDirection: Vector = direction.toMinimalVector();
        const player: Player = state.getCurrentPlayer();
        const nextCoord: Coord = coord.getNext(minimalisedDirection, 1);
        if (state.isNotOnBoard(nextCoord) ||
            state.getPieceAt(nextCoord).isCommandedBy(player))
        {
            return MGPOptional.empty();
        }
        if (this.isPresentIn(nextCoord, flownOvers)) {
            if (state.getPieceAt(nextCoord).isOccupied()) {
                return MGPOptional.empty();
            }
            // If it's empty, we can pass through it
        }
        if (state.getPieceAt(nextCoord).isEmpty()) {
            return this.getFirstCapturableCoordForFlyingCapture(state,
                                                                nextCoord,
                                                                minimalisedDirection,
                                                                flownOvers,
                                                                config);
        } else {
            return MGPOptional.of(nextCoord);
        }
    }

    private getPieceDirections(state: CheckersState, coord: Coord, isCapture: boolean, config: CheckersConfig)
    : Vector[]
    {
        const piece: CheckersStack = state.getPieceAt(coord);
        const pieceOwner: Player = piece.getCommander().player;
        // Since player zero must go up and player one go down
        const verticalDirection: number = pieceOwner.getYDirection();
        const directions: Vector[] = [
            Ordinal.factory.fromDelta(-1, verticalDirection).get(), // left diagonal
            Ordinal.factory.fromDelta(1, verticalDirection).get(), // right diagonal
        ];
        if (isCapture && config.frisianCaptureAllowed) {
            const frisianForward: Vector = new Vector(0, 2 * verticalDirection);
            directions.push(
                new Vector(-2, 0), // left frisian
                new Vector(2, 0), // right frisian
                frisianForward, // up frisian
            );
            if (config.simplePieceCanCaptureBackwards) {
                const frisianBackward: Vector = new Vector(0, -2 * verticalDirection);
                directions.push(frisianBackward); // down frisian
            }
        }
        const isLegalCaptureBackward: boolean = isCapture && config.simplePieceCanCaptureBackwards;
        if (state.getPieceAt(coord).getCommander().isPromoted || isLegalCaptureBackward) {
            directions.push(
                Ordinal.factory.fromDelta(-1, - verticalDirection).get(), // down left diagonal
                Ordinal.factory.fromDelta(1, - verticalDirection).get(), // down right diagonal
            );
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

    private getPieceSteps(state: CheckersState, coord: Coord, config: CheckersConfig): CheckersMove[] {
        const pieceMoves: CheckersMove[] = [];
        const directions: Vector[] = this.getPieceDirections(state, coord, false, config);
        for (const direction of directions) {
            const isPromotedPiece: boolean = state.getPieceAt(coord).getCommander().isPromoted;
            if (config.promotedPiecesCanFly && isPromotedPiece) {
                let landing: Coord = coord;
                let previousJumpWasPossible: boolean = true;
                while (previousJumpWasPossible) {
                    landing = landing.getNext(direction, 1);
                    previousJumpWasPossible = state.isEmptyAt(landing);
                    if (previousJumpWasPossible) {
                        const newStep: CheckersMove = CheckersMove.fromStep(coord, landing);
                        pieceMoves.push(newStep);
                    }
                }
            } else {
                const landing: Coord = coord.getNext(direction, 1);
                if (state.isEmptyAt(landing)) {
                    const newStep: CheckersMove = CheckersMove.fromStep(coord, landing);
                    pieceMoves.push(newStep);
                }
            }
        }
        return pieceMoves;
    }

    public override applyLegalMove(move: CheckersMove, state: CheckersState, config: CheckersConfig)
    : CheckersState
    {
        return this.applyMove(move, state, config).incrementTurn();
    }

    public applyMove(move: CheckersMove, state: CheckersState, config: CheckersConfig): CheckersState {
        const moveStart: Coord = move.getStartingCoord();
        const moveEnd: Coord = move.getEndingCoord();
        let movingStack: CheckersStack = state.getPieceAt(moveStart);
        let resultingState: CheckersState = state.remove(moveStart);
        if (move.isStep === false) {
            for (const capturedCoord of this.getCapturedCoords(move, state)) {
                if (config.canStackPieces) {
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
        const finishLine: number = state.getFinishLineOf(state.getCurrentPlayer());
        const promotedMidCapture: boolean =
            config.canPromoteMidCapture &&
            move.coords.some((c: Coord) => c.y === finishLine);
        if (moveEnd.y === finishLine || promotedMidCapture) {
            resultingState = resultingState.set(moveEnd, movingStack.promoteCommander());
        }
        return resultingState;
    }

    private getCapturedCoords(move: CheckersMove, state: CheckersState): MGPUniqueList<Coord> {
        const steppedOverCoords: MGPUniqueList<Coord> = move.getSteppedOverCoords();
        return steppedOverCoords.filter((coord: Coord) =>
            state.getPieceAt(coord).isOccupied() &&
            coord.equals(move.getStartingCoord()) === false);
    }

    private hasDuplicateCaptures(move: CheckersMove, state: CheckersState): boolean {
        const capturesWithDuplicates: Coord[] =
            move.getSteppedOverCoordsWithDuplicates().filter((coord: Coord) =>
                state.getPieceAt(coord).isOccupied() &&
                coord.equals(move.getStartingCoord()) === false);
        return capturesWithDuplicates.length > this.getCapturedCoords(move, state).size();
    }

    public override isLegal(move: CheckersMove, state: CheckersState, config: CheckersConfig)
    : MGPValidation
    {
        const moveOwnershipValidity: MGPValidation = this.getMoveOwnershipValidity(move, state, config);
        if (moveOwnershipValidity.isFailure()) { // out of range, opponent, empty spaces
            return moveOwnershipValidity;
        }
        const moveValidity: MGPValidation = this.isLegalSubMoveList(move, state, config);
        if (moveValidity.isFailure()) {
            return moveValidity;
        }
        const possibleCaptures: CheckersMove[] = this.getCompleteCaptures(state, config);
        if (possibleCaptures.length === 0) {
            return MGPValidation.SUCCESS;
        } else {
            return this.isLegalCaptureChoice(move, state, possibleCaptures, config);
        }
    }

    private getMoveOwnershipValidity(move: CheckersMove, state: CheckersState, config: CheckersConfig): MGPValidation {
        const outOfRangeCoord: MGPOptional<Coord> = this.getMoveOutOfRangeCoord(move, config);
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
        return MGPValidation.SUCCESS;
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
        let stack: CheckersStack = state.getPieceAt(move.coords[0]);
        const isSimpleJump: boolean = move.coords.length === 2;
        const stateWithoutStarting: CheckersState = state.remove(move.coords[0]);
        const finishLine: number = state.getFinishLineOf(state.getCurrentPlayer());
        for (let i: number = 1; i < move.coords.length; i++) {
            const previousCoord: Coord = move.coords[i - 1];
            const landingCoord: Coord = move.coords[i];
            if (config.canPromoteMidCapture && previousCoord.y === finishLine) {
                stack = stack.promoteCommander();
            }
            const subMoveValidity: MGPValidation =
                this.getSubMoveValidity(stack, isSimpleJump, previousCoord, landingCoord, stateWithoutStarting, config);
            if (subMoveValidity.isFailure()) {
                return subMoveValidity;
            }
        }
        return MGPValidation.SUCCESS;
    }

    public getSubMoveValidity(stack: CheckersStack,
                              isSimpleJump: boolean,
                              start: Coord,
                              end: Coord,
                              state: CheckersState,
                              config: CheckersConfig)
    : MGPValidation
    {
        const landingPiece: CheckersStack = state.getPieceAt(end);
        if (landingPiece.getStackSize() > 0) {
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        const directionValidity: MGPValidation = this.getDirectionValidity(start, end, config);
        if (directionValidity.isFailure()) {
            return directionValidity;
        }
        const flownOverPlayers: Player[] = this.getFlownOverPlayers(start, end, state);
        let isCapture: boolean;
        if (flownOverPlayers.length === 0) { // No Capture
            if (isSimpleJump) {
                // This is a simple jump without capture, must be a promoted piece (this part is checked later)
                isCapture = false;
            } else {
                // This is a sequence of capture that finishes with a non capture
                return MGPValidation.failure(CheckersFailure.MOVE_CANNOT_CONTINUE_AFTER_NON_CAPTURE_MOVE());
            }
        } else if (flownOverPlayers.length > 1) { // Capturing 2+ pieces
            return MGPValidation.failure(CheckersFailure.CANNOT_JUMP_OVER_SEVERAL_PIECES());
        } else { // Single Capture
            if (flownOverPlayers.some((player: Player) => player.equals(state.getCurrentPlayer()))) {
                return MGPValidation.failure(RulesFailure.CANNOT_SELF_CAPTURE());
            }
            isCapture = true;
        }
        if (this.isNormalPieceGoingBackwardIllegaly(stack, start, end, state, config)) {
            return MGPValidation.failure(CheckersFailure.CANNOT_GO_BACKWARD());
        }
        const flyLegality: MGPValidation = this.getFlyLegality(stack, start, end, isCapture, config);
        if (flyLegality.isFailure()) {
            return flyLegality;
        }
        return MGPValidation.SUCCESS;
    }

    private getDirectionValidity(start: Coord, end: Coord, config: CheckersConfig): MGPValidation {
        const direction: MGPFallible<Ordinal> = start.getDirectionToward(end);
        if (direction.isFailure()) {
            return MGPValidation.failure(direction.getReason());
        }
        if (direction.get().isOrthogonal()) {
            if (config.frisianCaptureAllowed) {
                const frisianSize: number = start.getDistanceToward(end);
                if (frisianSize % 2 === 1) {
                    return MGPValidation.failure(CheckersFailure.FRISIAN_CAPTURE_MUST_BE_EVEN());
                } else if (frisianSize === 2) {
                    return MGPValidation.failure(CheckersFailure.INVALID_FRISIAN_MOVE());
                }
            } else {
                return MGPValidation.failure(CheckersFailure.CANNOT_MOVE_ORTHOGONALLY());
            }
        }
        return MGPValidation.SUCCESS;
    }

    public getFlownOverPlayers(start: Coord, end: Coord, state: CheckersState): Player[] {
        const fliedOverCoords: Coord[] = start.getCoordsToward(end);
        const fliedOverPieces: CheckersStack[] = fliedOverCoords.map((coord: Coord) => state.getPieceAt(coord));
        const fliedOverOccupiedStacks: CheckersStack[] =
            fliedOverPieces.filter((stack: CheckersStack) => stack.isOccupied());
        return fliedOverOccupiedStacks.map((stack: CheckersStack) => stack.getCommander().player);
    }

    /**
     * @param stepStart the start of the step
     * @param stepEnd the end of the step
     * @param state the state before the step
     * @param config the config
     */
    private isNormalPieceGoingBackwardIllegaly(piece: CheckersStack,
                                               stepStart: Coord,
                                               stepEnd: Coord,
                                               state: CheckersState,
                                               config: CheckersConfig)
    : boolean
    {
        const commander: CheckersPiece = piece.getCommander();
        if (commander.isPromoted) {
            return false;
        } // Here: we check a normal piece
        const opponent: Player = state.getCurrentOpponent();
        const moveDirection: number = stepStart.getDirectionToward(stepEnd).get().y;
        const distance: number = stepStart.getDistanceToward(stepEnd);
        const isBackward: boolean = moveDirection === opponent.getYDirection();
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

    private getFlyLegality(stack: CheckersStack,
                           stepStart: Coord,
                           stepEnd: Coord,
                           isCapture: boolean,
                           config: CheckersConfig)
    : MGPValidation
    {
        const distance: number = stepStart.getDistanceToward(stepEnd);
        if (isCapture) {
            if (distance === 2) {
                return MGPValidation.SUCCESS;
            }
            if (distance === 4 && config.frisianCaptureAllowed) {
                return MGPValidation.SUCCESS;
            }
        } else {
            if (distance === 1) {
                return MGPValidation.SUCCESS;
            }
        }
        if (config.promotedPiecesCanFly) {
            if (stack.getCommander().isPromoted) {
                return MGPValidation.SUCCESS; // Legal promoted fly
            } else { // Normal piece cannot fly
                if (isCapture) {
                    return MGPValidation.failure(CheckersFailure.FLYING_CAPTURE_IS_FORBIDDEN_FOR_NORMAL_PIECES());
                } else {
                    return MGPValidation.failure(CheckersFailure.NORMAL_PIECES_CANNOT_MOVE_LIKE_THIS());
                }
            }
        } else { // No piece are allowed to fly
            return MGPValidation.failure(CheckersFailure.NO_PIECE_CAN_DO_LONG_JUMP());
        }
    }

    /**
    * @param move the chosen capture
    * @param possibleCaptures all possible captures
    * @param config the config
    * @returns whether or not this move is amongst the possible capture, based on global-capture group
    * The check aspect are only based on the rules mustMakeMaximalCapture and partialCapture rules
    */
    private isLegalCaptureChoice(move: CheckersMove,
                                 state: CheckersState,
                                 possibleCaptures: CheckersMove[],
                                 config: CheckersConfig)
    : MGPValidation
    {
        if (this.hasDuplicateCaptures(move, state)) {
            return MGPValidation.failure(CheckersFailure.CANNOT_CAPTURE_TWICE_THE_SAME_COORD());
        }
        if (move.isStep) {
            return MGPValidation.failure(CheckersFailure.CANNOT_SKIP_CAPTURE());
        }
        if (config.mustMakeMaximalCapture) {
            const legalCaptures: CheckersMove[] =
                ArrayUtils.maximumsBy(possibleCaptures, (m: CheckersMove) => m.coords.length);
            const captureSize: number = move.coords.length;
            const awaitedCaptureSize: number = legalCaptures[0].coords.length;
            if (captureSize === awaitedCaptureSize) {
                return MGPValidation.SUCCESS;
            } else if (legalCaptures.some((m: CheckersMove) => move.isPrefix(m))) {
                return MGPValidation.failure(CheckersFailure.MUST_FINISH_CAPTURING());
            } else {
                Utils.assert(awaitedCaptureSize > captureSize, 'capture is longer than it should!');
                return MGPValidation.failure(CheckersFailure.MUST_DO_LONGEST_CAPTURE());
            }
        } else {
            if (possibleCaptures.some((m: CheckersMove) => m.equals(move))) {
                return MGPValidation.SUCCESS;
            } else {
                return MGPValidation.failure(CheckersFailure.MUST_FINISH_CAPTURING());
            }
        }
    }

    public override getGameStatus(node: CheckersNode, config: CheckersConfig): GameStatus {
        const state: CheckersState = node.gameState;
        const captures: CheckersMove[] = this.getCompleteCaptures(state, config);
        if (captures.length > 0 || this.getSteps(state, config).length > 0) {
            return GameStatus.ONGOING;
        } else {
            return GameStatus.getVictory(state.getCurrentOpponent());
        }
    }

}
