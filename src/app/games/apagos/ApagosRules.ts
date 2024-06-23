import { GameStatus } from 'src/app/jscaip/GameStatus';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { MGPOptional, MGPValidation, Utils } from '@everyboard/lib';
import { ApagosCoord } from './ApagosCoord';
import { ApagosFailure } from './ApagosFailure';
import { ApagosMove } from './ApagosMove';
import { ApagosSquare } from './ApagosSquare';
import { ApagosState } from './ApagosState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

export class ApagosNode extends GameNode<ApagosMove, ApagosState> {}

export class ApagosRules extends Rules<ApagosMove, ApagosState> {

    public static PIECES_PER_PLAYER: number = 10;

    private static singleton: MGPOptional<ApagosRules> = MGPOptional.empty();

    public static get(): ApagosRules {
        if (ApagosRules.singleton.isAbsent()) {
            ApagosRules.singleton = MGPOptional.of(new ApagosRules());
        }
        return ApagosRules.singleton.get();
    }

    public override getInitialState(): ApagosState {
        return ApagosState.fromRepresentation(0, [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [7, 5, 3, 1],
        ], ApagosRules.PIECES_PER_PLAYER, ApagosRules.PIECES_PER_PLAYER);
    }

    public override applyLegalMove(move: ApagosMove,
                                   state: ApagosState,
                                   _config: NoConfig,
                                   _info: void)
    : ApagosState
    {
        if (move.isDrop()) {
            return this.applyLegalDrop(move, state);
        } else {
            return this.applyLegalTransfer(move, state);
        }
    }

    private applyLegalDrop(move: ApagosMove, state: ApagosState): ApagosState {
        const remaining: PlayerNumberMap = state.getRemainingCopy();
        remaining.add(move.piece.get(), - 1);
        const nextTurnState: ApagosState = new ApagosState(state.turn + 1, state.board, remaining);
        const piece: Player = move.piece.get();
        const newSquare: ApagosSquare = nextTurnState.getPieceAt(move.landing).addPiece(piece);
        if (move.landing === ApagosCoord.THREE) {
            return nextTurnState.updateAt(move.landing, newSquare);
        } else {
            const upperCoord: ApagosCoord = ApagosCoord.of(move.landing.x + 1);
            const descendingSquare: ApagosSquare = nextTurnState.getPieceAt(upperCoord);
            const intermediaryState: ApagosState = nextTurnState.updateAt(move.landing, descendingSquare);
            return intermediaryState.updateAt(upperCoord, newSquare);
        }
    }
    private applyLegalTransfer(move: ApagosMove, state: ApagosState): ApagosState {
        const currentPlayer: Player = state.getCurrentPlayer();
        const starting: ApagosCoord = move.starting.get();
        const newStartingSquare: ApagosSquare = state.getPieceAt(starting).substractPiece(currentPlayer);
        const newLandingSquare: ApagosSquare = state.getPieceAt(move.landing).addPiece(currentPlayer);
        let resultingState: ApagosState = state.updateAt(starting, newStartingSquare);
        resultingState = resultingState.updateAt(move.landing, newLandingSquare);
        return new ApagosState(resultingState.turn + 1, resultingState.board, resultingState.remaining);
    }
    public override isLegal(move: ApagosMove, state: ApagosState): MGPValidation {
        if (state.getPieceAt(move.landing).isFull()) {
            return MGPValidation.failure(ApagosFailure.CANNOT_LAND_ON_A_FULL_SQUARE());
        }
        if (move.isDrop()) {
            return this.isLegalDrop(move, state);
        } else {
            return this.isLegalSlideDown(move, state);
        }
    }
    private isLegalDrop(move: ApagosMove, state: ApagosState): MGPValidation {
        if (state.getRemaining(move.piece.get()) <= 0) {
            return MGPValidation.failure(ApagosFailure.NO_PIECE_REMAINING_TO_DROP());
        }
        return MGPValidation.SUCCESS;
    }
    private isLegalSlideDown(move: ApagosMove, state: ApagosState): MGPValidation {
        const currentPlayer: Player = state.getCurrentPlayer();
        const startingSquare: ApagosSquare = state.getPieceAt(move.starting.get());
        if (startingSquare.count(currentPlayer) === 0) {
            return MGPValidation.failure(ApagosFailure.NO_PIECE_OF_YOU_IN_CHOSEN_SQUARE());
        }
        return MGPValidation.SUCCESS;
    }
    public override getGameStatus(node: ApagosNode): GameStatus {
        const state: ApagosState = node.gameState;
        for (let x: number = 0; x < 4; x++) {
            if (state.getPieceAt(ApagosCoord.of(x)).isFull() === false) {
                return GameStatus.ONGOING;
            }
        }
        const winner: PlayerOrNone = state.getPieceAt(ApagosCoord.THREE).getDominatingPlayer();
        Utils.assert(winner.isPlayer(), 'winner can only be a player if the game is finished');
        return GameStatus.getVictory(winner as Player);
    }
}
