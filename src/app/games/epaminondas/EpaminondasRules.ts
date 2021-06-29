import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { EpaminondasLegalityStatus } from './epaminondaslegalitystatus';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasPartSlice } from './EpaminondasPartSlice';
import { EpaminondasFailure } from './EpaminondasFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

export class EpaminondasNode extends MGPNode<EpaminondasRules,
                                             EpaminondasMove,
                                             EpaminondasPartSlice,
                                             EpaminondasLegalityStatus> {}

export class EpaminondasRules extends Rules<EpaminondasMove, EpaminondasPartSlice, EpaminondasLegalityStatus> {

    public static isLegal(move: EpaminondasMove, slice: EpaminondasPartSlice): EpaminondasLegalityStatus {
        const phalanxValidity: MGPValidation = this.getPhalanxValidity(slice, move);
        if (phalanxValidity.isFailure()) {
            return EpaminondasLegalityStatus.failure(phalanxValidity.reason);
        }
        const landingStatus: EpaminondasLegalityStatus = this.getLandingStatus(slice, move);
        if (landingStatus.legal.isFailure()) {
            return landingStatus;
        }
        const newBoard: number[][] = landingStatus.newBoard;
        const ENNEMY: number = slice.getCurrentEnnemy().value;
        const captureValidity: EpaminondasLegalityStatus =
            EpaminondasRules.getCaptureValidity(slice, newBoard, move, ENNEMY);
        if (captureValidity.legal.isFailure()) {
            return EpaminondasLegalityStatus.failure(captureValidity.legal.reason);
        }
        return { newBoard, legal: MGPValidation.SUCCESS };
    }
    public static getPhalanxValidity(slice: EpaminondasPartSlice, move: EpaminondasMove): MGPValidation {
        let coord: Coord = move.coord;
        let soldierIndex: number = 0;
        let caseContent: number;
        const ENNEMY: number = slice.getCurrentEnnemy().value;
        while (soldierIndex < move.movedPieces) {
            if (coord.isNotInRange(14, 12)) {
                return MGPValidation.failure(EpaminondasFailure.PHALANX_CANNOT_CONTAIN_PIECES_OUTSIDE_BOARD);
            }
            caseContent = slice.getBoardAt(coord);
            if (caseContent === Player.NONE.value) {
                return MGPValidation.failure(EpaminondasFailure.PHALANX_CANNOT_CONTAIN_EMPTY_CASE);
            }
            if (caseContent === ENNEMY) {
                return MGPValidation.failure(EpaminondasFailure.PHALANX_CANNOT_CONTAIN_ENEMY_PIECE);
            }
            coord = coord.getNext(move.direction, 1);
            soldierIndex++;
        }
        return MGPValidation.SUCCESS;
    }
    public static getLandingStatus(slice: EpaminondasPartSlice, move: EpaminondasMove): EpaminondasLegalityStatus {
        const newBoard: number[][] = slice.getCopiedBoard();
        const CURRENT_PLAYER: number = slice.getCurrentPlayer().value;
        let emptied: Coord = move.coord;
        let landingCoord: Coord = move.coord.getNext(move.direction, move.movedPieces);
        let landingIndex: number = 0;
        while (landingIndex + 1 < move.stepSize) {
            newBoard[emptied.y][emptied.x] = Player.NONE.value;
            newBoard[landingCoord.y][landingCoord.x] = CURRENT_PLAYER;
            if (landingCoord.isNotInRange(14, 12)) {
                return EpaminondasLegalityStatus.failure(EpaminondasFailure.PHALANX_IS_LEAVING_BOARD);
            }
            if (slice.getBoardAt(landingCoord) !== Player.NONE.value) {
                return EpaminondasLegalityStatus.failure(EpaminondasFailure.SOMETHING_IN_PHALANX_WAY);
            }
            landingIndex++;
            landingCoord = landingCoord.getNext(move.direction, 1);
            emptied = emptied.getNext(move.direction, 1);
        }
        if (landingCoord.isNotInRange(14, 12)) {
            return EpaminondasLegalityStatus.failure(EpaminondasFailure.PHALANX_IS_LEAVING_BOARD);
        }
        if (slice.getBoardAt(landingCoord) === CURRENT_PLAYER) {
            return EpaminondasLegalityStatus.failure(RulesFailure.CANNOT_SELF_CAPTURE);
        }
        newBoard[emptied.y][emptied.x] = Player.NONE.value;
        newBoard[landingCoord.y][landingCoord.x] = CURRENT_PLAYER;
        return { newBoard, legal: MGPValidation.SUCCESS };
    }
    public static getCaptureValidity(oldSlice: EpaminondasPartSlice,
                                     board: number[][],
                                     move: EpaminondasMove,
                                     ENNEMY: number)
    : EpaminondasLegalityStatus
    {
        let capturedSoldier: Coord = move.coord.getNext(move.direction, move.movedPieces + move.stepSize - 1);
        const EMPTY: number = Player.NONE.value;
        let captured: number = 0;
        while (capturedSoldier.isInRange(14, 12) &&
               oldSlice.getBoardAt(capturedSoldier) === ENNEMY
        ) {
            // Capture
            if (captured > 0) {
                board[capturedSoldier.y][capturedSoldier.x] = EMPTY;
            }
            captured++;
            if (captured >= move.movedPieces) {
                return EpaminondasLegalityStatus.failure(EpaminondasFailure.PHALANX_SHOULD_BE_GREATER_TO_CAPTURE);
            }
            capturedSoldier = capturedSoldier.getNext(move.direction, 1);
        }
        return { newBoard: board, legal: MGPValidation.SUCCESS };
    }
    public isLegal(move: EpaminondasMove, slice: EpaminondasPartSlice): EpaminondasLegalityStatus {
        return EpaminondasRules.isLegal(move, slice);
    }
    public applyLegalMove(move: EpaminondasMove,
                          slice: EpaminondasPartSlice,
                          status: EpaminondasLegalityStatus)
    : EpaminondasPartSlice
    {
        const resultingSlice: EpaminondasPartSlice = new EpaminondasPartSlice(status.newBoard, slice.turn + 1);
        return resultingSlice;
    }
    public getGameStatus(node: EpaminondasNode): GameStatus {
        const state: EpaminondasPartSlice = node.gamePartSlice;
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
        return GameStatus.ONGOING;
    }
}
