import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { EpaminondasFailure } from './EpaminondasFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export type EpaminondasLegalityInformation = Table<Player>;


export class EpaminondasNode extends MGPNode<EpaminondasRules,
                                             EpaminondasMove,
                                             EpaminondasState,
                                             EpaminondasLegalityInformation> {}

export class EpaminondasRules extends Rules<EpaminondasMove, EpaminondasState, EpaminondasLegalityInformation> {

    public static isLegal(move: EpaminondasMove, state: EpaminondasState): MGPFallible<EpaminondasLegalityInformation> {
        const phalanxValidity: MGPValidation = this.getPhalanxValidity(state, move);
        if (phalanxValidity.isFailure()) {
            return MGPFallible.failure(phalanxValidity.getReason());
        }
        const landingStatus: MGPFallible<EpaminondasLegalityInformation> = this.getLandingStatus(state, move);
        if (landingStatus.isFailure()) {
            return landingStatus;
        }
        const newBoard: Player[][] = ArrayUtils.copyBiArray(landingStatus.get());
        const OPPONENT: Player = state.getCurrentOpponent();
        const captureValidity: MGPFallible<EpaminondasLegalityInformation> =
            EpaminondasRules.getCaptureValidity(state, newBoard, move, OPPONENT);
        if (captureValidity.isFailure()) {
            return captureValidity;
        }
        return MGPFallible.success(captureValidity.get());
    }
    public static getPhalanxValidity(state: EpaminondasState, move: EpaminondasMove): MGPValidation {
        let coord: Coord = move.coord;
        let soldierIndex: number = 0;
        let caseContent: Player;
        const OPPONENT: Player = state.getCurrentOpponent();
        while (soldierIndex < move.movedPieces) {
            if (coord.isNotInRange(14, 12)) {
                return MGPValidation.failure(EpaminondasFailure.PHALANX_CANNOT_CONTAIN_PIECES_OUTSIDE_BOARD());
            }
            caseContent = state.getPieceAt(coord);
            if (caseContent === Player.NONE) {
                return MGPValidation.failure(EpaminondasFailure.PHALANX_CANNOT_CONTAIN_EMPTY_CASE());
            }
            if (caseContent === OPPONENT) {
                return MGPValidation.failure(EpaminondasFailure.PHALANX_CANNOT_CONTAIN_OPPONENT_PIECE());
            }
            coord = coord.getNext(move.direction, 1);
            soldierIndex++;
        }
        return MGPValidation.SUCCESS;
    }
    public static getLandingStatus(state: EpaminondasState, move: EpaminondasMove)
    : MGPFallible<EpaminondasLegalityInformation> {
        const newBoard: Player[][] = state.getCopiedBoard();
        const CURRENT_PLAYER: Player = state.getCurrentPlayer();
        let emptied: Coord = move.coord;
        let landingCoord: Coord = move.coord.getNext(move.direction, move.movedPieces);
        let landingIndex: number = 0;
        while (landingIndex + 1 < move.stepSize) {
            newBoard[emptied.y][emptied.x] = Player.NONE;
            newBoard[landingCoord.y][landingCoord.x] = CURRENT_PLAYER;
            if (landingCoord.isNotInRange(14, 12)) {
                return MGPFallible.failure(EpaminondasFailure.PHALANX_IS_LEAVING_BOARD());
            }
            if (state.getPieceAt(landingCoord) !== Player.NONE) {
                return MGPFallible.failure(EpaminondasFailure.SOMETHING_IN_PHALANX_WAY());
            }
            landingIndex++;
            landingCoord = landingCoord.getNext(move.direction, 1);
            emptied = emptied.getNext(move.direction, 1);
        }
        if (landingCoord.isNotInRange(14, 12)) {
            return MGPFallible.failure(EpaminondasFailure.PHALANX_IS_LEAVING_BOARD());
        }
        if (state.getPieceAt(landingCoord) === CURRENT_PLAYER) {
            return MGPFallible.failure(RulesFailure.CANNOT_SELF_CAPTURE());
        }
        newBoard[emptied.y][emptied.x] = Player.NONE;
        newBoard[landingCoord.y][landingCoord.x] = CURRENT_PLAYER;
        return MGPFallible.success(newBoard);
    }
    public static getCaptureValidity(oldState: EpaminondasState,
                                     board: Player[][],
                                     move: EpaminondasMove,
                                     OPPONENT: Player)
    : MGPFallible<EpaminondasLegalityInformation>
    {
        let capturedSoldier: Coord = move.coord.getNext(move.direction, move.movedPieces + move.stepSize - 1);
        const EMPTY: Player = Player.NONE;
        let captured: number = 0;
        while (capturedSoldier.isInRange(14, 12) &&
               oldState.getPieceAt(capturedSoldier) === OPPONENT
        ) {
            // Capture
            if (captured > 0) {
                board[capturedSoldier.y][capturedSoldier.x] = EMPTY;
            }
            captured++;
            if (captured >= move.movedPieces) {
                return MGPFallible.failure(EpaminondasFailure.PHALANX_SHOULD_BE_GREATER_TO_CAPTURE());
            }
            capturedSoldier = capturedSoldier.getNext(move.direction, 1);
        }
        return MGPFallible.success(board);
    }
    public isLegal(move: EpaminondasMove, state: EpaminondasState): MGPFallible<EpaminondasLegalityInformation> {
        return EpaminondasRules.isLegal(move, state);
    }
    public applyLegalMove(_move: EpaminondasMove,
                          state: EpaminondasState,
                          newBoard: EpaminondasLegalityInformation)
    : EpaminondasState
    {
        const resultingState: EpaminondasState = new EpaminondasState(newBoard, state.turn + 1);
        return resultingState;
    }
    public getGameStatus(node: EpaminondasNode): GameStatus {
        const state: EpaminondasState = node.gameState;
        const zerosInFirstLine: number = state.count(Player.ZERO, 0);
        const onesInLastLine: number = state.count(Player.ONE, 11);
        if (state.turn % 2 === 0) {
            if (zerosInFirstLine > onesInLastLine) {
                return GameStatus.ZERO_WON;
            }
        } else {
            if (onesInLastLine > zerosInFirstLine) {
                return GameStatus.ONE_WON;
            }
        }
        const doesZeroOwnPieces: boolean = state.doesOwnPiece(Player.ZERO);
        if (doesZeroOwnPieces === false) {
            return GameStatus.ONE_WON;
        }
        const doesOneOwnPieces: boolean = state.doesOwnPiece(Player.ONE);
        if (doesOneOwnPieces === false) {
            return GameStatus.ZERO_WON;
        }
        return GameStatus.ONGOING;
    }
}
