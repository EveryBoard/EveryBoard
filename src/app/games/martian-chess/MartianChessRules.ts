import { Coord } from 'src/app/jscaip/Coord';
import { Direction, Vector } from 'src/app/jscaip/Direction';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { assert } from 'src/app/utils/assert';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MartianChessMove, MartianChessMoveFailure } from './MartianChessMove';
import { MartianChessPiece, MartianChessState } from './MartianChessState';

export class MartianChessRulesFailure {

    public static readonly MUST_CHOOSE_PIECE_FROM_YOUR_TERRITORY: () => string = () => $localize`Choose a piece from your territory to move it`;

    public static readonly CANNOT_CAPTURE_YOUR_OWN_PIECE_NOR_PROMOTE_IT: () => string = () => $localize`This move is not a valid promotion nor a valid capture`;

    public static readonly CANNOT_UNDO_LAST_MOVE: () => string = () => $localize`You cannot do a move that is the reversed of the last one`;
}

export class MartianChessMoveResult {

    score: MGPMap<Player, number>;

    landingPiece: MartianChessPiece;
}

export class MartianChessNode extends MGPNode<Rules<MartianChessMove, MartianChessState, MartianChessMoveResult>,
                                              MartianChessMove,
                                              MartianChessState,
                                              MartianChessMoveResult> {}

export class MartianChessRules extends Rules<MartianChessMove, MartianChessState, MartianChessMoveResult> {

    public applyLegalMove(move: MartianChessMove,
                          state: MartianChessState,
                          info: MartianChessMoveResult)
    : MartianChessState
    {
        const newBoard: MartianChessPiece[][] = state.getCopiedBoard();
        newBoard[move.coord.y][move.coord.x] = MartianChessPiece.EMPTY;
        const landingPiece: MartianChessPiece = info.landingPiece;
        newBoard[move.end.y][move.end.x] = landingPiece;
        const captured: MGPMap<Player, number> = info.score;
        let countDown: MGPOptional<number> = state.countDown;
        if (countDown.isPresent()) {
            const isCapture: boolean = this.isMoveCapture(move, state);
            if (isCapture) {
                countDown = MGPOptional.of(7);
            } else {
                const previousRemainingTurn: number = state.countDown.get();
                countDown = MGPOptional.of(previousRemainingTurn - 1);
            }
        }
        if (move.calledTheClock) {
            countDown = MGPOptional.of(7);
        }
        return new MartianChessState(newBoard, state.turn + 1, MGPOptional.of(move), countDown, captured);
    }
    public isLegal(move: MartianChessMove, state: MartianChessState): MGPFallible<MartianChessMoveResult> {
        this.assertNonDoubleClockCall(move, state);
        const moveLegality: MGPFallible<void> = this.isLegalMove(move, state);
        if (moveLegality.isFailure()) {
            return MGPFallible.failure(moveLegality.getReason());
        }
        if (move.isUndoneBy(state.lastMove)) {
            return MGPFallible.failure(MartianChessRulesFailure.CANNOT_UNDO_LAST_MOVE());
        }
        if (this.isMoveFieldPromotion(move, state)) {
            return this.isLegalFieldPromotion(move, state);
        }
        const landingPiece: MartianChessPiece = state.getPieceAt(move.coord);
        const score: MGPMap<Player, number> = state.captured.getCopy();
        if (this.isMoveCapture(move, state)) {
            const currentPlayer: Player = state.getCurrentPlayer();
            let playerScore: number = score.get(currentPlayer).get();
            const capturedValue: number = state.getPieceAt(move.end).getValue();
            playerScore += capturedValue;
            score.replace(currentPlayer, playerScore);
            score.makeImmutable();
        }
        const moveResult: MartianChessMoveResult = { landingPiece, score };
        return MGPFallible.success(moveResult);
    }
    private assertNonDoubleClockCall(move: MartianChessMove, state: MartianChessState) {
        const clockHadAlreadyBeenCalled: boolean = state.countDown.isPresent();
        const clockCalledThisTurn: boolean = move.calledTheClock;
        const doubleClockCall: boolean = clockHadAlreadyBeenCalled && clockCalledThisTurn;
        assert(doubleClockCall === false, 'Dont do that you poopydozer');
    }
    private isMoveCapture(move: MartianChessMove, state: MartianChessState): boolean {
        const moveEndInOpponentTerritory: boolean = state.isInOpponentTerritory(move.end);
        const moveEndOnPiece: boolean = state.getPieceAt(move.end) !== MartianChessPiece.EMPTY;
        return moveEndInOpponentTerritory && moveEndOnPiece;
    }
    private isMoveFieldPromotion(move: MartianChessMove, state: MartianChessState): boolean {
        const moveEndInPlayerTerritory: boolean = state.isInPlayerTerritory(move.end);
        const moveEndOnPiece: boolean = state.getPieceAt(move.end) !== MartianChessPiece.EMPTY;
        return moveEndInPlayerTerritory && moveEndOnPiece;
    }
    private isLegalFieldPromotion(move: MartianChessMove,
                                  state: MartianChessState)
    : MGPFallible<MartianChessMoveResult>
    {
        const optCreatedPiece: MGPOptional<MartianChessPiece> = this.getCreatedPiece(move, state);
        if (optCreatedPiece.isAbsent()) {
            return MGPFallible.failure(MartianChessRulesFailure.CANNOT_CAPTURE_YOUR_OWN_PIECE_NOR_PROMOTE_IT());
        }
        const createdPiece: MartianChessPiece = optCreatedPiece.get();
        if (state.isTherePieceOnPlayerSide(createdPiece)) {
            return MGPFallible.failure(MartianChessRulesFailure.CANNOT_CAPTURE_YOUR_OWN_PIECE_NOR_PROMOTE_IT());
        } else {
            const moveResult: MartianChessMoveResult = {
                landingPiece: createdPiece,
                score: state.captured.getCopy(),
            };
            return MGPFallible.success(moveResult);
        }
    }
    private isLegalMove(move: MartianChessMove, state: MartianChessState): MGPFallible<void> {
        const moveStartInPlayerTerritory: boolean = state.isInPlayerTerritory(move.coord);
        if (moveStartInPlayerTerritory === false) {
            return MGPFallible.failure(MartianChessRulesFailure.MUST_CHOOSE_PIECE_FROM_YOUR_TERRITORY());
        }
        const movedPiece: MartianChessPiece = state.getPieceAt(move.coord);
        if (movedPiece === MartianChessPiece.EMPTY) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        } else if (movedPiece === MartianChessPiece.PAWN) {
            if (move.isValidForPawn()) {
                return MGPFallible.success(undefined);
            } else {
                return MGPFallible.failure(MartianChessMoveFailure.PAWN_MUST_MOVE_ONE_DIAGONAL_STEP());
            }
        } else if (movedPiece === MartianChessPiece.DRONE) {
            if (move.isInvalidForDrone()) {
                return MGPFallible.failure(MartianChessMoveFailure.DRONE_MUST_DO_TWO_ORTHOGONAL_STEP());
            }
            const direction: Direction = move.coord.getDirectionToward(move.end).get();
            if (direction.isDiagonal()) {
                const isDiagonalLegalForDrone: boolean = this.isDiagonalLegalForDrone(state, direction, move.coord);
                if (isDiagonalLegalForDrone === false) {
                    return MGPFallible.failure(RulesFailure.SOMETHING_IN_THE_WAY());
                }
            }
        }
        const direction: Direction = move.coord.getDirectionToward(move.end).get();
        let coord: Coord = move.coord.getNext(direction);
        while (coord.equals(move.end) === false) {
            if (state.getPieceAt(coord) !== MartianChessPiece.EMPTY) {
                return MGPFallible.failure(RulesFailure.SOMETHING_IN_THE_WAY());
            }
            coord = coord.getNext(direction);
        }
        return MGPFallible.success(undefined);
    }
    public isDiagonalLegalForDrone(state: MartianChessState, diagonal: Direction, startingCoord: Coord): boolean {
        const verticalVector: Vector = new Vector(0, diagonal.y);
        const verticalStep: Coord = startingCoord.getNext(verticalVector);
        const verticalCoordIsStepable: boolean = state.getPieceAt(verticalStep) === MartianChessPiece.EMPTY;
        const horizontalVector: Vector = new Vector(diagonal.x, 0);
        const horizontalStep: Coord = startingCoord.getNext(horizontalVector);
        const horizontalCoordIsStepable: boolean = state.getPieceAt(horizontalStep) === MartianChessPiece.EMPTY;
        return verticalCoordIsStepable || horizontalCoordIsStepable;
    }
    public getCreatedPiece(move: MartianChessMove, state: MartianChessState): MGPOptional<MartianChessPiece> {
        const startPiece: MartianChessPiece = state.getPieceAt(move.coord);
        const endPiece: MartianChessPiece = state.getPieceAt(move.end);
        return MartianChessPiece.tryMerge(startPiece, endPiece);
    }
    public getGameStatus(node: MartianChessNode): GameStatus {
        const state: MartianChessState = node.gameState;
        if (state.countDown.getOrElse(42) === 0) {
            return this.getGameStatusScoreVictoryOr(state, GameStatus.DRAW);
        }
        const emptyTerritory: MGPOptional<Player> = state.getEmptyTerritory();
        if (emptyTerritory.isPresent()) {
            const lastPlayer: Player = state.getCurrentOpponent();
            const lastPlayerVictoryStatus: GameStatus = GameStatus.getVictory(lastPlayer);
            return this.getGameStatusScoreVictoryOr(state, lastPlayerVictoryStatus);
        }
        return GameStatus.ONGOING;
    }
    public getGameStatusScoreVictoryOr(state: MartianChessState, defaultStatus: GameStatus): GameStatus {
        const scoreZero: number = state.getScoreOf(Player.ZERO);
        const scoreOne: number = state.getScoreOf(Player.ONE);
        if (scoreZero > scoreOne) return GameStatus.ZERO_WON;
        else if (scoreOne > scoreZero) return GameStatus.ONE_WON;
        else return defaultStatus;
    }
}
