import { ArrayUtils } from '@everyboard/lib';

import { MoveGenerator } from '../../jscaip/AI/AI';
import { Coord } from '../../jscaip/Coord';
import { Player } from '../../jscaip/Player';
import { Debug } from '../../utils/Debug';

import { TaflConfig } from './TaflConfig';
import { TaflMove } from './TaflMove';
import { TaflNode, TaflRules } from './TaflRules';
import { TaflState } from './TaflState';

@Debug.log
export class TaflMoveGenerator<M extends TaflMove> extends MoveGenerator<M, TaflState, TaflConfig> {

    public constructor(private readonly rules: TaflRules<M>) {
        super();
    }

    public override getListMoves(node: TaflNode<M>, config: TaflConfig): M[] {
        const state: TaflState = node.gameState;
        const currentPlayer: Player = state.getCurrentPlayer();
        const listMoves: M[] = this.rules.getPlayerListMoves(currentPlayer, state, config);
        return this.orderMoves(state, listMoves, config);
    }

    public orderMoves(state: TaflState, listMoves: M[], config: TaflConfig): M[] {
        const king: Coord = this.rules.getKingCoord(state).get();
        const invader: Player = this.rules.getInvader(config);
        if (state.getCurrentPlayer() === invader) { // Invader
            ArrayUtils.sortByDescending(listMoves, (move: TaflMove) => {
                return - move.getEnd().getOrthogonalDistance(king);
            });
        } else {
            ArrayUtils.sortByDescending(listMoves, (move: TaflMove) => {
                if (move.getStart().equals(king)) {
                    if (state.isExternalThrone(move.getEnd())) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    return 0;
                }
            });
        }
        return listMoves;
    }

}
