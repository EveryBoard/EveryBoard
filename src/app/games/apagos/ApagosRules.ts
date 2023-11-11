import { GameStatus } from 'src/app/jscaip/GameStatus';
import { GameNode } from 'src/app/jscaip/GameNode';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from '../../utils/MGPValidation';
import { ApagosCoord } from './ApagosCoord';
import { ApagosFailure } from './ApagosFailure';
import { ApagosMove } from './ApagosMove';
import { ApagosSquare } from './ApagosSquare';
import { ApagosState } from './ApagosState';
import { Utils } from 'src/app/utils/utils';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';

export class ApagosNode extends GameNode<ApagosMove, ApagosState> {}

export class ApagosRules extends Rules<ApagosMove, ApagosState> {

    private static singleton: MGPOptional<ApagosRules> = MGPOptional.empty();

    public static get(): ApagosRules {
        if (ApagosRules.singleton.isAbsent()) {
            ApagosRules.singleton = MGPOptional.of(new ApagosRules());
        }
        return ApagosRules.singleton.get();
    }
    private constructor() {
        super(ApagosState);
    }

    public applyLegalMove(move: ApagosMove, state: ApagosState, _config: RulesConfig, _info: void): ApagosState {
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
    public isLegal(move: ApagosMove, state: ApagosState): MGPValidation {
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
    public getGameStatus(node: ApagosNode): GameStatus {
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
