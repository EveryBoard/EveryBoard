import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TrexoMove } from './TrexoMove';
import { TrexoSpace, TrexoState } from './TrexoState';

export class TrexoRulesFailure {
    public static readonly CANNOT_DROP_ON_ONLY_ONE_PIECE: Localized = () => $localize`TODOTOD: CANNOT_DROP_ON_ONLY_ONE_PIECE`;
    public static readonly CANNOT_DROP_PIECE_ON_UNEVEN_GROUNDS: Localized = () => $localize`TODOTOD: CANNOT_DROP_PIECE_ON_UNEVEN_GROUNDS`;
}

export class TrexoNode extends MGPNode<Rules<TrexoMove, TrexoState>, TrexoMove, TrexoState> {}

export class TrexoRules extends Rules<TrexoMove, TrexoState> {

    private static instance: MGPOptional<TrexoRules> = MGPOptional.empty();

    public static get(): TrexoRules {
        if (TrexoRules.instance.isAbsent()) {
            TrexoRules.instance = MGPOptional.of(new TrexoRules());
        }
        return TrexoRules.instance.get();
    }
    private constructor() {
        super(TrexoState);
    }
    public applyLegalMove(move: TrexoMove, state: TrexoState): TrexoState {
        return state
            .drop(move.zero, Player.ZERO)
            .drop(move.one, Player.ONE)
            .incrementTurn();
    }
    public isLegal(move: TrexoMove, state: TrexoState): MGPFallible<void> {
        if (this.isUnevenGround(move, state)) {
            return MGPFallible.failure(TrexoRulesFailure.CANNOT_DROP_PIECE_ON_UNEVEN_GROUNDS());
        }
        if (this.landsOnOnlyOnePiece(move, state)) {
            return MGPFallible.failure(TrexoRulesFailure.CANNOT_DROP_ON_ONLY_ONE_PIECE());
        }
        return MGPFallible.success(undefined);
    }
    public isUnevenGround(move: TrexoMove, state: TrexoState): boolean {
        const zero: TrexoSpace = state.getPieceAt(move.zero);
        const one: TrexoSpace = state.getPieceAt(move.one);
        return zero.height !== one.height;
    }
    public landsOnOnlyOnePiece(move: TrexoMove, state: TrexoState): boolean {
        const zeroSpace: TrexoSpace = state.getPieceAt(move.zero);
        const oneSpace: TrexoSpace = state.getPieceAt(move.one);
        if (zeroSpace.landingTurn === -1 && oneSpace.landingTurn === -1) {
            return false;
        }
        return zeroSpace.landingTurn === oneSpace.landingTurn;
    }
    public getGameStatus(node: TrexoNode): GameStatus {
        throw new Error('getGameStatus not implemented.');
    }

}
