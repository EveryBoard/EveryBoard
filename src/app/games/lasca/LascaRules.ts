import { Coord } from 'src/app/jscaip/Coord';
import { Ordinal } from 'src/app/jscaip/Ordinal';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { Player } from 'src/app/jscaip/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPOptional, MGPValidation } from '@everyboard/lib';
import { LascaMove } from './LascaMove';
import { LascaFailure } from './LascaFailure';
import { LascaPiece, LascaStack, LascaState } from './LascaState';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { Table } from 'src/app/jscaip/TableUtils';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { CoordSet } from 'src/app/jscaip/CoordSet';

export class LascaNode extends GameNode<LascaMove, LascaState> {}

export class LascaRules extends Rules<LascaMove, LascaState> {

    private static singleton: MGPOptional<LascaRules> = MGPOptional.empty();

    public static get(): LascaRules {
        if (LascaRules.singleton.isAbsent()) {
            LascaRules.singleton = MGPOptional.of(new LascaRules());
        }
        return LascaRules.singleton.get();
    }

    public override getInitialState(): LascaState {
        const O: LascaStack = new LascaStack([LascaPiece.ZERO]);
        const X: LascaStack = new LascaStack([LascaPiece.ONE]);
        const _: LascaStack = LascaStack.EMPTY;
        const board: Table<LascaStack> = [
            [X, _, X, _, X, _, X],
            [_, X, _, X, _, X, _],
            [X, _, X, _, X, _, X],
            [_, _, _, _, _, _, _],
            [O, _, O, _, O, _, O],
            [_, O, _, O, _, O, _],
            [O, _, O, _, O, _, O],
        ];
        return new LascaState(board, 0);
    }

    public getCaptures(state: LascaState): LascaMove[] {
        const player: Player = state.getCurrentPlayer();
        return this.getCapturesOf(state, player);
    }

    public getCapturesOf(state: LascaState, player: Player): LascaMove[] {
        const captures: LascaMove[] = [];
        const playerPieces: Coord[] = state.getStacksOf(player);
        for (const playerPiece of playerPieces) {
            captures.push(...this.getPieceCaptures(state, playerPiece));
        }
        return captures;
    }

    public getPieceCaptures(state: LascaState, coord: Coord): LascaMove[] {
        let pieceMoves: LascaMove[] = [];
        const piece: LascaStack = state.getPieceAt(coord);
        const pieceOwner: Player = piece.getCommander().player;
        const opponent: Player = pieceOwner.getOpponent();
        const directions: Ordinal[] = this.getPieceDirections(state, coord);
        const moved: LascaStack = state.getPieceAt(coord);
        for (const direction of directions) {
            const captured: Coord = coord.getNext(direction, 1);
            if (state.isOnBoard(captured) && state.getPieceAt(captured).isCommandedBy(opponent)) {
                const landing: Coord = captured.getNext(direction, 1);
                if (state.isOnBoard(landing) && state.getPieceAt(landing).isEmpty()) {
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

    private getPieceDirections(state: LascaState, coord: Coord): Ordinal[] {
        const piece: LascaStack = state.getPieceAt(coord);
        const pieceOwner: Player = piece.getCommander().player;
        // Since player zero must go up (-1) and player one go down (+1)
        // Then we can use the score modifier that happens to match to the "vertical direction" of each player
        const verticalDirection: number = pieceOwner.getScoreModifier();
        const directions: Ordinal[] = [
            Ordinal.factory.fromDelta(-1, verticalDirection).get(),
            Ordinal.factory.fromDelta(1, verticalDirection).get(),
        ];
        if (state.getPieceAt(coord).getCommander().isOfficer) {
            directions.push(Ordinal.factory.fromDelta(-1, - verticalDirection).get(),
                            Ordinal.factory.fromDelta(1, - verticalDirection).get());
        }
        return directions;
    }

    public getSteps(state: LascaState): LascaMove[] {
        const player: Player = state.getCurrentPlayer();
        return this.getStepsOf(state, player);
    }

    public getStepsOf(state: LascaState, player: Player): LascaMove[] {
        const steps: LascaMove[] = [];
        const playerPieces: Coord[] = state.getStacksOf(player);
        for (const playerPiece of playerPieces) {
            steps.push(...this.getPieceSteps(state, playerPiece));
        }
        return steps;
    }

    public getPieceSteps(state: LascaState, coord: Coord): LascaMove[] {
        const pieceMoves: LascaMove[] = [];
        const directions: Ordinal[] = this.getPieceDirections(state, coord);
        for (const direction of directions) {
            const landing: Coord = coord.getNext(direction, 1);
            if (state.isOnBoard(landing) && state.getPieceAt(landing).isEmpty()) {
                const newStep: LascaMove = LascaMove.fromStep(coord, landing).get();
                pieceMoves.push(newStep);
            }
        }
        return pieceMoves;
    }

    public override applyLegalMove(move: LascaMove, state: LascaState, _config: NoConfig, _info: void): LascaState {
        const moveStart: Coord = move.getStartingCoord();
        const moveEnd: Coord = move.getEndingCoord();
        let movingStack: LascaStack = state.getPieceAt(moveStart);
        let resultingState: LascaState = state.remove(moveStart);
        if (move.isStep === false) {
            for (const capturedCoord of move.getCapturedCoords().get()) {
                const capturedSpace: LascaStack = state.getPieceAt(capturedCoord);
                const commander: LascaPiece = capturedSpace.getCommander();
                movingStack = movingStack.capturePiece(commander);

                const remainingStack: LascaStack = capturedSpace.getPiecesUnderCommander();
                resultingState = resultingState.set(capturedCoord, remainingStack);
            }
        }
        resultingState = resultingState.set(moveEnd, movingStack);
        if (moveEnd.y === state.getFinishLineOf(state.getCurrentPlayer())) {
            const promotedCommander: LascaStack = movingStack.promoteCommander();
            resultingState = resultingState.set(moveEnd, promotedCommander);
        }
        return resultingState.incrementTurn();
    }

    public override isLegal(move: LascaMove, state: LascaState): MGPValidation {
        const moveStart: Coord = move.getStartingCoord();
        if (state.getPieceAt(moveStart).isEmpty()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        const movedStack: LascaStack = state.getPieceAt(moveStart);
        const opponent: Player = state.getCurrentOpponent();
        if (movedStack.isCommandedBy(opponent)) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        const secondCoord: Coord = move.coords.get(1);
        if (movedStack.getCommander().isOfficer === false) {
            const moveDirection: number = moveStart.getDirectionToward(secondCoord).get().y;
            if (moveDirection === opponent.getScoreModifier()) {
                return MGPValidation.failure(LascaFailure.CANNOT_GO_BACKWARD());
            }
        }
        if (state.getPieceAt(secondCoord).isEmpty() === false) {
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        const possibleCaptures: LascaMove[] = this.getCaptures(state);
        if (move.isStep) {
            if (possibleCaptures.length > 0) {
                return MGPValidation.failure(LascaFailure.CANNOT_SKIP_CAPTURE());
            } else {
                return MGPValidation.SUCCESS;
            }
        } else {
            return this.isLegalCapture(move, state, possibleCaptures);
        }
    }

    public isLegalCapture(move: LascaMove, state: LascaState, possibleCaptures: LascaMove[]): MGPValidation {
        const player: Player = state.getCurrentPlayer();
        const steppedOverCoords: CoordSet = move.getCapturedCoords().get();
        for (const steppedOverCoord of steppedOverCoords) {
            const steppedOverSpace: LascaStack = state.getPieceAt(steppedOverCoord);
            if (steppedOverSpace.isCommandedBy(player)) {
                return MGPValidation.failure(RulesFailure.CANNOT_SELF_CAPTURE());
            }
            if (steppedOverSpace.isEmpty()) {
                return MGPValidation.failure(LascaFailure.CANNOT_CAPTURE_EMPTY_SPACE());
            }
        }
        if (possibleCaptures.some((m: LascaMove) => m.equals(move))) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(LascaFailure.MUST_FINISH_CAPTURING());
        }
    }

    public override getGameStatus(node: LascaNode): GameStatus {
        const state: LascaState = node.gameState;
        const captures: LascaMove[] = this.getCaptures(state);
        if (captures.length > 0 || this.getSteps(state).length > 0) {
            return GameStatus.ONGOING;
        } else {
            return GameStatus.getVictory(state.getCurrentOpponent());
        }
    }

}
