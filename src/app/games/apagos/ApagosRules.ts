import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { MGPMap } from 'src/app/utils/MGPMap';
import { ApagosCoord } from './ApagosCoord';
import { ApagosMessage } from './ApagosMessage';
import { ApagosMove } from './ApagosMove';
import { ApagosSquare } from './ApagosSquare';
import { ApagosState } from './ApagosState';

export class ApagosNode extends MGPNode<Rules<ApagosMove, ApagosState, LegalityStatus>, ApagosMove, ApagosState> {}

export class ApagosRules extends Rules<ApagosMove, ApagosState> {

    public static readonly singleton: ApagosRules = new ApagosRules(ApagosState);

    public applyLegalMove(move: ApagosMove, state: ApagosState, status: LegalityStatus): ApagosState {
        if (move.isDrop()) {
            return this.applyLegalDrop(move, state);
        } else {
            return this.applyLegalSlideDown(move, state);
        }
    }
    public applyLegalDrop(move: ApagosMove, state: ApagosState): ApagosState {
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
    public applyLegalSlideDown(move: ApagosMove, state: ApagosState): ApagosState {
        const currentPlayer: Player = state.getCurrentPlayer();
        const starting: ApagosCoord = move.starting.get();
        const newStartingSquare: ApagosSquare = state.getPieceAt(starting).substractPiece(currentPlayer);
        const newLandingSquare: ApagosSquare = state.getPieceAt(move.landing).addPiece(currentPlayer);
        let resultingState: ApagosState = state.updateAt(starting, newStartingSquare);
        resultingState = resultingState.updateAt(move.landing, newLandingSquare);
        return new ApagosState(resultingState.turn + 1, resultingState.board, resultingState.remaining);
    }
    public isLegal(move: ApagosMove, state: ApagosState): LegalityStatus {
        if (state.getPieceAt(move.landing).isFull()) {
            return LegalityStatus.failure(ApagosMessage.CANNOT_LAND_ON_A_FULL_SQUARE());
        }
        if (move.isDrop()) {
            return this.isLegalDrop(move, state);
        } else {
            return this.isLegalSlideDown(move, state);
        }
    }
    public isLegalDrop(move: ApagosMove, state: ApagosState): LegalityStatus {
        if (state.getRemaining(move.piece.get()) <= 0) {
            return LegalityStatus.failure(ApagosMessage.NO_PIECE_REMAINING());
        }
        return LegalityStatus.SUCCESS;
    }
    public isLegalSlideDown(move: ApagosMove, state: ApagosState): LegalityStatus {
        const currentPlayer: Player = state.getCurrentPlayer();
        const startingSquare: ApagosSquare = state.getPieceAt(move.starting.get());
        if (startingSquare.count(currentPlayer) === 0) {
            return LegalityStatus.failure(ApagosMessage.NO_PIECE_OF_YOU_IN_CHOSEN_SQUARE());
        }
        return LegalityStatus.SUCCESS;
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
