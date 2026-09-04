import { MGPOptional, MGPValidation } from '@everyboard/lib';

import { NumberConfig } from '../../components/wrapper-components/rules-configuration/NumberConfig';
import { RulesConfigDescription } from '../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { RulesConfigDescriptionLocalizable } from '../../components/wrapper-components/rules-configuration/RulesConfigDescriptionLocalizable';
import { GameNode } from '../../jscaip/AI/GameNode';
import { GameStatus } from '../../jscaip/GameStatus';
import { Player, PlayerOrNone } from '../../jscaip/Player';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { ConfigurableRules } from '../../jscaip/Rules';
import { RulesConfig } from '../../jscaip/RulesConfigUtil';
import { MGPValidators } from '../../utils/MGPValidator';

import { ApagosFailure } from './ApagosFailure';
import { ApagosMove } from './ApagosMove';
import { ApagosSquare } from './ApagosSquare';
import { ApagosState } from './ApagosState';

export type ApagosConfig = RulesConfig & {

    width: number;

    increment: number;

};

export class ApagosNode extends GameNode<ApagosMove, ApagosState> {}

export class ApagosRules extends ConfigurableRules<ApagosMove, ApagosState, ApagosConfig> {

    private static singleton: MGPOptional<ApagosRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<ApagosConfig> =
        new RulesConfigDescription<ApagosConfig>({
            name: (): string => $localize`Apagos`,
            config: {
                width: new NumberConfig(4, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(2, 7)),
                increment: new NumberConfig(2, () => $localize`Increment`, MGPValidators.range(0, 3)),
            },
        });

    public static get(): ApagosRules {
        if (ApagosRules.singleton.isAbsent()) {
            ApagosRules.singleton = MGPOptional.of(new ApagosRules());
        }
        return ApagosRules.singleton.get();
    }

    public override getRulesConfigDescription(): RulesConfigDescription<ApagosConfig> {
        return ApagosRules.RULES_CONFIG_DESCRIPTION;
    }

    public override getInitialState(config: ApagosConfig): ApagosState {
        console.log(config == null ? 'WHAT THE FUCK' : 'ok')
        const width: number = config.width;
        const increment: number = config.increment;

        const zeroPieces: number[] = [];
        const onePieces: number[] = [];
        const sizes: number[] = [];
        let currentSize: number = 1; // the first square will always be 1
        let numberOfPieces: number = 0;
        for (let x: number = 0; x < width; x++) {
            zeroPieces.push(0);
            onePieces.push(0);
            sizes.push(currentSize);
            numberOfPieces += Math.ceil(currentSize / 2);
            currentSize += increment;
        }

        return ApagosState.fromRepresentation(0, [
            zeroPieces,
            onePieces,
            sizes.reverse(),
        ], numberOfPieces, numberOfPieces);
    }

    public override applyLegalMove(move: ApagosMove,
                                   state: ApagosState,
                                   config: ApagosConfig,
                                   _info: void)
    : ApagosState
    {
        if (move.isDrop()) {
            return this.applyLegalDrop(move, state, config);
        } else {
            return this.applyLegalTransfer(move, state);
        }
    }

    private applyLegalDrop(move: ApagosMove, state: ApagosState, config: ApagosConfig): ApagosState {
        const remaining: PlayerNumberMap = state.getRemainingCopy();
        remaining.add(move.piece.get(), -1);
        const nextTurnState: ApagosState = new ApagosState(state.turn + 1, state.board, remaining);
        const piece: Player = move.piece.get();
        const newSquare: ApagosSquare = nextTurnState.getPieceAt(move.landing).addPiece(piece);
        if (move.landing === config.width -1) {
            return nextTurnState.updateAt(move.landing, newSquare);
        } else {
            const descendingX: number = move.landing + 1;
            const descendingSquare: ApagosSquare = nextTurnState.getPieceAt(descendingX);
            const intermediaryState: ApagosState = nextTurnState.updateAt(move.landing, descendingSquare);
            return intermediaryState.updateAt(descendingX, newSquare);
        }
    }

    private applyLegalTransfer(move: ApagosMove, state: ApagosState): ApagosState {
        const currentPlayer: Player = state.getCurrentPlayer();
        const starting: number = move.starting.get();
        const newStartingSquare: ApagosSquare = state.getPieceAt(starting).subtractPiece(currentPlayer);
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

    public override getGameStatus(node: ApagosNode, config: ApagosConfig): GameStatus {
        const width: number = config.width;
        const state: ApagosState = node.gameState;
        for (let x: number = 0; x < width; x++) {
            if (state.getPieceAt(x).isFull() === false) {
                return GameStatus.ONGOING;
            }
        }
        for (let x: number = width - 1; x >= 0; x--) {
            const dominating: PlayerOrNone = state.getPieceAt(x).getDominatingPlayer();
            if (dominating.isPlayer()) {
                return GameStatus.getVictory(dominating);
            }
        }
        return GameStatus.DRAW;
    }
}
