import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Coord, CoordFailure } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { EpaminondasFailure } from './EpaminondasFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export type EpaminondasConfig = {
    width: number;
    emptyHeight: number;
    rowOfSoldier: number;
};

export const epaminondasConfig: EpaminondasConfig = {
    width: 14,
    emptyHeight: 8,
    rowOfSoldier: 2,
};

export type EpaminondasLegalityInformation = Table<PlayerOrNone>;

export class EpaminondasNode extends MGPNode<EpaminondasRules,
                                             EpaminondasMove,
                                             EpaminondasState,
                                             EpaminondasConfig,
                                             EpaminondasLegalityInformation> {}

export class EpaminondasRules
    extends Rules<EpaminondasMove, EpaminondasState, EpaminondasConfig, EpaminondasLegalityInformation>
{
    private static singleton: MGPOptional<EpaminondasRules> = MGPOptional.empty();

    public static get(): EpaminondasRules {
        if (EpaminondasRules.singleton.isAbsent()) {
            EpaminondasRules.singleton = MGPOptional.of(new EpaminondasRules());
        }
        return EpaminondasRules.singleton.get();
    }
    private constructor() {
        super(EpaminondasState, epaminondasConfig);
    }
    public static isLegal(move: EpaminondasMove, state: EpaminondasState): MGPFallible<EpaminondasLegalityInformation> {
        const phalanxValidity: MGPValidation = this.getPhalanxValidity(state, move);
        if (phalanxValidity.isFailure()) {
            return MGPFallible.failure(phalanxValidity.getReason());
        }
        const landingStatus: MGPFallible<EpaminondasLegalityInformation> = this.getLandingStatus(state, move);
        if (landingStatus.isFailure()) {
            return landingStatus;
        }
        const newBoard: PlayerOrNone[][] = ArrayUtils.copyBiArray(landingStatus.get());
        const opponent: Player = state.getCurrentOpponent();
        const captureValidity: MGPFallible<EpaminondasLegalityInformation> =
            EpaminondasRules.getCaptureValidity(state, newBoard, move, opponent);
        if (captureValidity.isFailure()) {
            return captureValidity;
        }
        return MGPFallible.success(captureValidity.get());
    }
    public static getPhalanxValidity(state: EpaminondasState, move: EpaminondasMove): MGPValidation {
        let coord: Coord = move.coord;
        if (state.isOnBoard(coord) === false) {
            return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(coord));
        }
        let soldierIndex: number = 0;
        const opponent: Player = state.getCurrentOpponent();
        while (soldierIndex < move.movedPieces) {
            if (state.isOnBoard(coord) === false) {
                return MGPValidation.failure(EpaminondasFailure.PHALANX_CANNOT_CONTAIN_PIECES_OUTSIDE_BOARD());
            }
            const spaceContent: PlayerOrNone = state.getPieceAt(coord);
            if (spaceContent === PlayerOrNone.NONE) {
                return MGPValidation.failure(EpaminondasFailure.PHALANX_CANNOT_CONTAIN_EMPTY_SQUARE());
            }
            if (spaceContent === opponent) {
                return MGPValidation.failure(EpaminondasFailure.PHALANX_CANNOT_CONTAIN_OPPONENT_PIECE());
            }
            coord = coord.getNext(move.direction, 1);
            soldierIndex++;
        }
        return MGPValidation.SUCCESS;
    }
    public static getLandingStatus(state: EpaminondasState, move: EpaminondasMove)
    : MGPFallible<EpaminondasLegalityInformation> {
        const newBoard: PlayerOrNone[][] = state.getCopiedBoard();
        const currentPlayer: Player = state.getCurrentPlayer();
        let emptied: Coord = move.coord;
        let landingCoord: Coord = move.coord.getNext(move.direction, move.movedPieces);
        let landingIndex: number = 0;
        while (landingIndex + 1 < move.stepSize) {
            newBoard[emptied.y][emptied.x] = PlayerOrNone.NONE;
            newBoard[landingCoord.y][landingCoord.x] = currentPlayer;
            if (state.isOnBoard(landingCoord) === false) {
                return MGPFallible.failure(EpaminondasFailure.PHALANX_IS_LEAVING_BOARD());
            }
            if (state.getPieceAt(landingCoord).isPlayer()) {
                return MGPFallible.failure(EpaminondasFailure.SOMETHING_IN_PHALANX_WAY());
            }
            landingIndex++;
            landingCoord = landingCoord.getNext(move.direction, 1);
            emptied = emptied.getNext(move.direction, 1);
        }
        if (state.isOnBoard(landingCoord) === false) {
            return MGPFallible.failure(EpaminondasFailure.PHALANX_IS_LEAVING_BOARD());
        }
        if (state.getPieceAt(landingCoord) === currentPlayer) {
            return MGPFallible.failure(RulesFailure.SHOULD_LAND_ON_EMPTY_OR_OPPONENT_SPACE());
        }
        newBoard[emptied.y][emptied.x] = PlayerOrNone.NONE;
        newBoard[landingCoord.y][landingCoord.x] = currentPlayer;
        return MGPFallible.success(newBoard);
    }
    public static getCaptureValidity(oldState: EpaminondasState,
                                     board: PlayerOrNone[][],
                                     move: EpaminondasMove,
                                     opponent: Player)
    : MGPFallible<EpaminondasLegalityInformation>
    {
        let capturedSoldier: Coord = move.coord.getNext(move.direction, move.movedPieces + move.stepSize - 1);
        let captured: number = 0;
        while (oldState.isOnBoard(capturedSoldier) &&
               oldState.getPieceAt(capturedSoldier) === opponent)
        {
            // Capture
            if (captured > 0) {
                board[capturedSoldier.y][capturedSoldier.x] = PlayerOrNone.NONE;
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
        const height: number = state.board.length;
        const onesInLastLine: number = state.count(Player.ONE, height - 1);
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
