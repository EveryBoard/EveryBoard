import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPMap } from 'src/app/utils/MGPMap';
import { ApagosCoord } from './ApagosCoord';
import { ApagosFailure } from './ApagosFailure';
import { ApagosMove } from './ApagosMove';
import { ApagosSquare } from './ApagosSquare';
import { ApagosState } from './ApagosState';

export class ApagosNode extends MGPNode<ApagosRules, ApagosMove, ApagosState> {}

export class ApagosRules extends Rules<ApagosMove, ApagosState> {

    private static singleton: ApagosRules;

    public static get(): ApagosRules {
        if (ApagosRules.singleton == null) {
            ApagosRules.singleton = new ApagosRules(ApagosState);
        }
        MGPNode.ruler = this.singleton;
        return this.singleton;
    }
    public applyLegalMove(move: ApagosMove, state: ApagosState, _info: void): ApagosState {
        if (move.isDrop()) {
            return this.applyLegalDrop(move, state);
        } else {
            return this.applyLegalTransfer(move, state);
        }
    }
    private applyLegalDrop(move: ApagosMove, state: ApagosState): ApagosState {
        const remaining: MGPMap<Player, number> = state.getRemainingCopy();
        const oldValue: number = remaining.get(move.piece.get()).get();
        remaining.put(move.piece.get(), oldValue - 1);
        const nextTurnState: ApagosState = new ApagosState(state.turn + 1, state.board, remaining);
        const piece: Player = move.piece.get();
        const newSquare: ApagosSquare = nextTurnState.getPieceAt(move.landing).addPiece(piece);
        if (move.landing === ApagosCoord.THREE) {
            return nextTurnState.updateAt(move.landing, newSquare);
        } else {
            const upperCoord: ApagosCoord = ApagosCoord.from(move.landing.x + 1);
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
    public isLegal(move: ApagosMove, state: ApagosState): MGPFallible<void> {
        if (state.getPieceAt(move.landing).isFull()) {
            return MGPFallible.failure(ApagosFailure.CANNOT_LAND_ON_A_FULL_SQUARE());
        }
        if (move.isDrop()) {
            return this.isLegalDrop(move, state);
        } else {
            return this.isLegalSlideDown(move, state);
        }
    }
    private isLegalDrop(move: ApagosMove, state: ApagosState): MGPFallible<void> {
        if (state.getRemaining(move.piece.get()) <= 0) {
            return MGPFallible.failure(ApagosFailure.NO_PIECE_REMAINING_TO_DROP());
        }
        return MGPFallible.success(undefined);
    }
    private isLegalSlideDown(move: ApagosMove, state: ApagosState): MGPFallible<void> {
        const currentPlayer: Player = state.getCurrentPlayer();
        const startingSquare: ApagosSquare = state.getPieceAt(move.starting.get());
        if (startingSquare.count(currentPlayer) === 0) {
            return MGPFallible.failure(ApagosFailure.NO_PIECE_OF_YOU_IN_CHOSEN_SQUARE());
        }
        return MGPFallible.success(undefined);
    }
    public getGameStatus(node: ApagosNode): GameStatus {
        const state: ApagosState = node.gameState;
        for (let x: number = 0; x < 4; x++) {
            if (state.getPieceAt(ApagosCoord.from(x)).isFull() === false) {
                return GameStatus.ONGOING;
            }
        }
        const winner: Player = state.getPieceAt(ApagosCoord.THREE).getDominatingPlayer();
        return GameStatus.getVictory(winner);
    }
}
