import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { assert } from 'src/app/utils/assert';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MartianChessMove, MartianChessMoveFailure } from './MartianChessMove';
import { MartianChessCapture, MartianChessState } from './MartianChessState';
import { MartianChessPiece } from './MartianChessPiece';
import { MartianChessFailure } from './MartianChessFailure';
import { MGPValidation } from '../../utils/MGPValidation';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { GameConfig } from 'src/app/jscaip/ConfigUtil';

export interface MartianChessMoveResult {

    score: MGPMap<Player, MartianChessCapture>;

    finalPiece: MartianChessPiece;
}

export class MartianChessNode extends MGPNode<MartianChessRules,
                                              MartianChessMove,
                                              MartianChessState,
                                              GameConfig,
                                              MartianChessMoveResult> {}

export class MartianChessRules extends Rules<MartianChessMove, MartianChessState, GameConfig, MartianChessMoveResult> {

    public static readonly STARTING_COUNT_DOWN: MGPOptional<number> = MGPOptional.of(7);

    private static singleton: MGPOptional<MartianChessRules> = MGPOptional.empty();

    public static get(): MartianChessRules {
        if (MartianChessRules.singleton.isAbsent()) {
            MartianChessRules.singleton = MGPOptional.of(new MartianChessRules());
        }
        return MartianChessRules.singleton.get();
    }
    private constructor() {
        super(MartianChessState);
    }
    public applyLegalMove(move: MartianChessMove,
                          state: MartianChessState,
                          info: MartianChessMoveResult)
    : MartianChessState
    {
        const newBoard: MartianChessPiece[][] = state.getCopiedBoard();
        newBoard[move.getStart().y][move.getStart().x] = MartianChessPiece.EMPTY;
        const landingPiece: MartianChessPiece = info.finalPiece;
        newBoard[move.getEnd().y][move.getEnd().x] = landingPiece;
        const captured: MGPMap<Player, MartianChessCapture> = info.score;
        let countDown: MGPOptional<number> = state.countDown;
        if (countDown.isPresent()) {
            const isCapture: boolean = this.isCapture(move, state);
            if (isCapture) {
                countDown = MartianChessRules.STARTING_COUNT_DOWN;
            } else {
                const previousRemainingTurn: number = state.countDown.get();
                countDown = MGPOptional.of(previousRemainingTurn - 1);
            }
        }
        if (move.calledTheClock) {
            countDown = MartianChessRules.STARTING_COUNT_DOWN;
        }
        return new MartianChessState(newBoard, state.turn + 1, MGPOptional.of(move), countDown, captured);
    }
    public isLegal(move: MartianChessMove, state: MartianChessState): MGPFallible<MartianChessMoveResult> {
        this.assertNonDoubleClockCall(move, state);
        const moveLegality: MGPValidation = this.isLegalMove(move, state);
        if (moveLegality.isFailure()) {
            return moveLegality.toOtherFallible();
        }
        if (move.isUndoneBy(state.lastMove)) {
            return MGPFallible.failure(MartianChessFailure.CANNOT_UNDO_LAST_MOVE());
        }
        if (this.isFieldPromotion(move, state)) {
            return this.isLegalFieldPromotion(move, state);
        }
        const landingPiece: MartianChessPiece = state.getPieceAt(move.getStart());
        const captured: MGPMap<Player, MartianChessCapture> = state.captured.getCopy();
        if (this.isCapture(move, state)) {
            const currentPlayer: Player = state.getCurrentPlayer();
            let playerScore: MartianChessCapture = captured.get(currentPlayer).get();
            const capturedPiece: MartianChessPiece = state.getPieceAt(move.getEnd());
            playerScore = playerScore.add(capturedPiece);
            captured.replace(currentPlayer, playerScore);
            captured.makeImmutable();
        }
        const moveResult: MartianChessMoveResult = { finalPiece: landingPiece, score: captured };
        return MGPFallible.success(moveResult);
    }
    private assertNonDoubleClockCall(move: MartianChessMove, state: MartianChessState): void {
        const clockHadAlreadyBeenCalled: boolean = state.countDown.isPresent();
        const clockCalledThisTurn: boolean = move.calledTheClock;
        const doubleClockCall: boolean = clockHadAlreadyBeenCalled && clockCalledThisTurn;
        assert(doubleClockCall === false, 'Should not call the clock twice');
    }
    private isCapture(move: MartianChessMove, state: MartianChessState): boolean {
        const moveEndsInOpponentTerritory: boolean = state.isInOpponentTerritory(move.getEnd());
        const moveEndsOnPiece: boolean = state.getPieceAt(move.getEnd()) !== MartianChessPiece.EMPTY;
        return moveEndsInOpponentTerritory && moveEndsOnPiece;
    }
    private isFieldPromotion(move: MartianChessMove, state: MartianChessState): boolean {
        const moveEndsInPlayerTerritory: boolean = state.isInPlayerTerritory(move.getEnd());
        const moveEndsOnPiece: boolean = state.getPieceAt(move.getEnd()) !== MartianChessPiece.EMPTY;
        return moveEndsInPlayerTerritory && moveEndsOnPiece;
    }
    private isLegalFieldPromotion(move: MartianChessMove,
                                  state: MartianChessState)
    : MGPFallible<MartianChessMoveResult>
    {
        const optCreatedPiece: MGPOptional<MartianChessPiece> = this.getPromotedPiece(move, state);
        if (optCreatedPiece.isAbsent()) {
            return MGPFallible.failure(MartianChessFailure.CANNOT_CAPTURE_YOUR_OWN_PIECE_NOR_PROMOTE_IT());
        }
        const createdPiece: MartianChessPiece = optCreatedPiece.get();
        if (state.isTherePieceOnPlayerSide(createdPiece)) {
            return MGPFallible.failure(MartianChessFailure.CANNOT_CAPTURE_YOUR_OWN_PIECE_NOR_PROMOTE_IT());
        } else {
            const moveResult: MartianChessMoveResult = {
                finalPiece: createdPiece,
                score: state.captured.getCopy(),
            };
            return MGPFallible.success(moveResult);
        }
    }
    private isLegalMove(move: MartianChessMove, state: MartianChessState): MGPValidation {
        const moveStartsInPlayerTerritory: boolean = state.isInPlayerTerritory(move.getStart());
        if (moveStartsInPlayerTerritory === false) {
            return MGPValidation.failure(MartianChessFailure.MUST_CHOOSE_PIECE_FROM_YOUR_TERRITORY());
        }
        const movedPiece: MartianChessPiece = state.getPieceAt(move.getStart());
        if (movedPiece === MartianChessPiece.EMPTY) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        } else if (movedPiece === MartianChessPiece.PAWN) {
            if (move.isValidForPawn()) {
                return MGPValidation.SUCCESS;
            } else {
                return MGPValidation.failure(MartianChessMoveFailure.PAWN_MUST_MOVE_ONE_DIAGONAL_STEP());
            }
        } else if (movedPiece === MartianChessPiece.DRONE) {
            if (move.isValidForDrone() === false) {
                return MGPValidation.failure(MartianChessMoveFailure.DRONE_MUST_DO_TWO_ORTHOGONAL_STEPS());
            }
        }
        for (const coord of move.getStart().getUntil(move.getEnd())) {
            if (state.getPieceAt(coord) !== MartianChessPiece.EMPTY) {
                return MGPValidation.failure(RulesFailure.SOMETHING_IN_THE_WAY());
            }
        }
        return MGPValidation.SUCCESS;
    }
    public getPromotedPiece(move: MartianChessMove, state: MartianChessState): MGPOptional<MartianChessPiece> {
        const startPiece: MartianChessPiece = state.getPieceAt(move.getStart());
        const endPiece: MartianChessPiece = state.getPieceAt(move.getEnd());
        return MartianChessPiece.tryMerge(startPiece, endPiece);
    }
    public getGameStatus(node: MartianChessNode): GameStatus {
        const state: MartianChessState = node.gameState;
        if (state.countDown.equalsValue(0)) {
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
