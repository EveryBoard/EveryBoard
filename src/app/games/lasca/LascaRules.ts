import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { LascaMove } from './LascaMove';
import { LascaPiece, LascaSpace, LascaState } from './LascaState';

export class LascaNode extends MGPNode<Rules<LascaMove, LascaState>, LascaMove, LascaState> {}

export class LascaRulesFailure {

    public static readonly CANNOT_GO_BACKWARD: Localized = () => $localize`You cannot go backward with normal pieces!`;

    public static readonly CANNOT_CAPTURE_EMPTY_SPACE: Localized = () => $localize`You cannot capture an empty space, nor jump over it!`;

    public static readonly CANNOT_SKIP_CAPTURE: Localized = () => $localize`You must capture when it is possible!`;

    public static readonly MUST_FINISH_CAPTURING: Localized = () => $localize`You must finish this capture!`;
}

export class LascaRules extends Rules<LascaMove, LascaState> {

    private static singleton: MGPOptional<LascaRules> = MGPOptional.empty();

    public static get(): LascaRules {
        if (this.singleton.isAbsent()) {
            this.singleton = MGPOptional.of(new LascaRules(LascaState));
        }
        return this.singleton.get();
    }
    public getCaptures(state: LascaState): LascaMove[] {
        const captures: LascaMove[] = [];
        const player: Player = state.getCurrentPlayer();
        const playerPieces: Coord[] = state.getStacksOf(player);
        for (const playerPiece of playerPieces) {
            captures.push(...this.getPieceCaptures(state, playerPiece));
        }
        return captures;
    }
    public getPieceCaptures(state: LascaState, coord: Coord): LascaMove[] {
        let pieceMoves: LascaMove[] = [];
        const opponent: Player = state.getCurrentOpponent();
        const directions: Coord[] = this.getPieceDirections(state, coord);
        const moved: LascaSpace = state.getPieceAt(coord);
        for (const direction of directions) {
            const captured: Coord = coord.getNext(direction, 1);
            if (LascaMove.isOnBoard(captured) && state.getPieceAt(captured).isCommandedBy(opponent)) {
                const landing: Coord = captured.getNext(direction, 1);
                if (LascaMove.isOnBoard(landing) && state.getPieceAt(landing).isEmpty()) {
                    const fakePostCaptureState: LascaState = state.remove(coord).remove(captured).set(landing, moved);
                    // Not needed to do the real capture
                    const startOfMove: LascaMove = LascaMove.fromCapture([coord, landing]).get();
                    const endsOfMoves: LascaMove[] = this.getPieceCaptures(fakePostCaptureState, landing);
                    if (endsOfMoves.length === 0) {
                        pieceMoves = pieceMoves.concat(startOfMove);
                    } else {
                        const mergedMoves: LascaMove[] = endsOfMoves.map((m: LascaMove) => startOfMove.concatenate(m));
                        pieceMoves = pieceMoves.concat(mergedMoves);
                    }
                }
            }
        }
        return pieceMoves;
    }
    private getPieceDirections(state: LascaState, coord: Coord): Coord[] {
        const upDirection: number = state.getCurrentPlayer().getScoreModifier();
        const directions: Coord[] = [new Coord(-1, upDirection), new Coord(1, upDirection)];
        if (state.getPieceAt(coord).getCommander().isOfficer) {
            directions.push(new Coord(-1, - upDirection), new Coord(1, - upDirection));
        }
        return directions;
    }
    public getSteps(state: LascaState): LascaMove[] {
        const steps: LascaMove[] = [];
        const player: Player = state.getCurrentPlayer();
        const playerPieces: Coord[] = state.getStacksOf(player);
        for (const playerPiece of playerPieces) {
            steps.push(...this.getPieceSteps(state, playerPiece));
        }
        return steps;
    }
    public getPieceSteps(state: LascaState, coord: Coord): LascaMove[] {
        const pieceMoves: LascaMove[] = [];
        const directions: Coord[] = this.getPieceDirections(state, coord);
        for (const direction of directions) {
            const landing: Coord = coord.getNext(direction, 1);
            if (LascaMove.isOnBoard(landing) && state.getPieceAt(landing).isEmpty()) {
                const newStep: LascaMove = LascaMove.fromStep(coord, landing).get();
                pieceMoves.push(newStep);
            }
        }
        return pieceMoves;
    }
    public applyLegalMove(move: LascaMove, state: LascaState): LascaState {
        const moveStart: Coord = move.getStartingCoord();
        const moveEnd: Coord = move.getEndingCoord();
        let movingStack: LascaSpace = state.getPieceAt(moveStart);
        let resultingState: LascaState = state.remove(moveStart);
        if (move.isStep === false) {
            for (const capturedCoord of move.getCapturedCoords().get()) {
                const capturedSpace: LascaSpace = state.getPieceAt(capturedCoord);
                const commander: LascaPiece = capturedSpace.getCommander();
                movingStack = movingStack.capturePiece(commander);

                const reaminingStack: LascaSpace = capturedSpace.getPiecesUnderCommander();
                resultingState = resultingState.set(capturedCoord, reaminingStack);
            }
        }
        resultingState = resultingState.set(moveEnd, movingStack);
        if (moveEnd.y === state.getFinishLineOf(state.getCurrentPlayer())) {
            const promotedCapturer: LascaSpace = movingStack.promoteCommander();
            resultingState = resultingState.set(moveEnd, promotedCapturer);
        }
        return resultingState.incrementTurn();
    }
    public isLegal(move: LascaMove, state: LascaState): MGPFallible<void> {
        const moveStart: Coord = move.getStartingCoord();
        if (state.getPieceAt(moveStart).isEmpty()) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        const movedStack: LascaSpace = state.getPieceAt(moveStart);
        const opponent: Player = state.getCurrentOpponent();
        if (movedStack.isCommandedBy(opponent)) {
            return MGPFallible.failure(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }
        const secondCoord: Coord = move.getCoord(1).get();
        if (movedStack.getCommander().isOfficer === false) {
            const moveDirection: number = moveStart.getDirectionToward(secondCoord).get().y;
            if (moveDirection === opponent.getScoreModifier()) {
                return MGPFallible.failure(LascaRulesFailure.CANNOT_GO_BACKWARD());
            }
        }
        if (state.getPieceAt(secondCoord).isEmpty() === false) {
            return MGPFallible.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        const possibleCaptures: LascaMove[] = this.getCaptures(state);
        if (move.isStep) {
            if (possibleCaptures.length > 0) {
                return MGPFallible.failure(LascaRulesFailure.CANNOT_SKIP_CAPTURE());
            } else {
                return MGPFallible.success(undefined);
            }
        } else {
            return this.isLegalCapture(move, state, possibleCaptures);
        }
    }
    public isLegalCapture(move: LascaMove, state: LascaState, possibleCaptures: LascaMove[]): MGPFallible<void> {
        const player: Player = state.getCurrentPlayer();
        const steppedOverCoords: MGPSet<Coord> = move.getCapturedCoords().get();
        for (const steppedOverCoord of steppedOverCoords) {
            const steppedOverSpace: LascaSpace = state.getPieceAt(steppedOverCoord);
            if (steppedOverSpace.isCommandedBy(player)) {
                return MGPFallible.failure(RulesFailure.CANNOT_SELF_CAPTURE());
            }
            if (steppedOverSpace.isEmpty()) {
                return MGPFallible.failure(LascaRulesFailure.CANNOT_CAPTURE_EMPTY_SPACE());
            }
        }
        if (possibleCaptures.some((m: LascaMove) => m.equals(move))) {
            return MGPFallible.success(undefined);
        } else {
            return MGPFallible.failure(LascaRulesFailure.MUST_FINISH_CAPTURING());
        }
    }
    public getGameStatus(node: LascaNode): GameStatus {
        const state: LascaState = node.gameState;
        const captures: LascaMove[] = this.getCaptures(state);
        if (captures.length > 0 || this.getSteps(state).length > 0) {
            return GameStatus.ONGOING;
        } else {
            return GameStatus.getVictory(state.getCurrentOpponent());
        }
    }
}
